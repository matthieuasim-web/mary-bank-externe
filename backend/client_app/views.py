# client_app/views.py

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import connection
from django.utils import timezone
from datetime import timedelta

from .auth import ClientUser, ClientJWTAuthentication
from .serializers import (
    ClientLoginSerializer,
    ClientSetPasswordSerializer,
    ClientProfileSerializer,
    TransactionSerializer,
    TransfertSerializer,
)


class ClientLoginView(APIView):
    """
    Connexion client.
    POST /api/client/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ClientLoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        client = serializer.client_data
        
        # Créer un token JWT
        refresh = RefreshToken()
        refresh['numero_compte'] = client['numero_compte']
        refresh['client_id'] = client['id']
        refresh['type'] = 'client'
        
        # Mettre à jour last_login
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE clients_client 
                SET last_login = %s 
                WHERE id = %s
            """, [timezone.now(), client['id']])
        
        return Response({
            'status': 'success',
            'message': f'Bienvenue {client["prenom"]}',
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'client': {
                    'id': client['id'],
                    'numero_compte': client['numero_compte'],
                    'nom': client['nom'],
                    'post_nom': client['post_nom'],
                    'prenom': client['prenom'],
                    'nom_complet': f"{client['nom']} {client['post_nom']} {client['prenom']}",
                    'email': client['email'],
                    'telephone': client['telephone'],
                    'solde': str(client['solde']),
                    'devise': client['devise'],
                    'type_compte': client['type_compte'],
                }
            }
        })


class ClientSetPasswordView(APIView):
    """
    Définir le mot de passe (première connexion).
    POST /api/client/set-password/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ClientSetPasswordSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        return Response({
            'status': 'success',
            'message': 'Mot de passe défini avec succès. Vous pouvez maintenant vous connecter.'
        })


class ClientProfileView(APIView):
    """
    Profil du client connecté.
    GET /api/client/profile/
    """
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        client = request.user  # C'est notre ClientUser
        
        return Response({
            'status': 'success',
            'data': {
                'id': client.id,
                'numero_compte': client.numero_compte,
                'nom': client.nom,
                'post_nom': client.post_nom,
                'prenom': client.prenom,
                'nom_complet': client.nom_complet,
                'email': client.email,
                'telephone': client.telephone,
                'solde': str(client.solde),
                'devise': client.devise,
                'type_compte': client.type_compte,
                'statut': client.statut,
            }
        })


class SoldeView(APIView):
    """
    Consulter le solde.
    GET /api/client/solde/
    """
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        client = request.user
        
        return Response({
            'status': 'success',
            'data': {
                'solde': str(client.solde),
                'devise': client.devise,
                'numero_compte': client.numero_compte,
            }
        })


class TransactionHistoryView(APIView):
    """
    Historique des transactions du client.
    GET /api/client/transactions/
    """
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        client = request.user
        
        # Récupérer les transactions depuis la base
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    reference, type_transaction, montant, description,
                    ancien_solde, nouveau_solde, created_at
                FROM transactions_transaction 
                WHERE client_id = %s 
                ORDER BY created_at DESC
                LIMIT 50
            """, [client.id])
            
            rows = cursor.fetchall()
        
        transactions = []
        for row in rows:
            transactions.append({
                'reference': row[0],
                'type_transaction': row[1],
                'montant': str(row[2]),
                'description': row[3] or '',
                'ancien_solde': str(row[4]),
                'nouveau_solde': str(row[5]),
                'created_at': row[6].isoformat() if row[6] else None,
            })
        
        return Response({
            'status': 'success',
            'total': len(transactions),
            'data': transactions
        })


class RefreshTokenView(APIView):
    """
    Rafraîchir le token.
    POST /api/client/token/refresh/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'status': 'error',
                'message': 'Token refresh requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'status': 'success',
                'data': {
                    'access': str(refresh.access_token),
                }
            })
        except Exception:
            return Response({
                'status': 'error',
                'message': 'Token invalide ou expiré'
            }, status=status.HTTP_401_UNAUTHORIZED)
        

class TransfertView(APIView):
    """
    Effectuer un transfert vers un autre compte.
    POST /api/client/transfert/
    """
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        client = request.user  # ClientUser
        
        # Ajouter le contexte pour le serializer
        serializer = TransfertSerializer(
            data=request.data,
            context={
                'numero_compte_source': client.numero_compte,
                'solde': client.solde
            }
        )
        
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        compte_dest = serializer.validated_data['compte_dest']
        montant = serializer.validated_data['montant']
        description = serializer.validated_data.get('description', '')
        
        try:
            with connection.cursor() as cursor:
                # Démarrer une transaction PostgreSQL
                cursor.execute("BEGIN")
                
                # 1. Débiter le compte source
                ancien_solde_source = client.solde
                nouveau_solde_source = ancien_solde_source - montant
                
                cursor.execute("""
                    UPDATE clients_client 
                    SET solde = %s, updated_at = %s 
                    WHERE numero_compte = %s
                """, [nouveau_solde_source, timezone.now(), client.numero_compte])
                
                # 2. Créditer le compte destination
                cursor.execute("""
                    SELECT solde FROM clients_client WHERE numero_compte = %s
                """, [compte_dest])
                ancien_solde_dest = cursor.fetchone()[0]
                nouveau_solde_dest = ancien_solde_dest + montant
                
                cursor.execute("""
                    UPDATE clients_client 
                    SET solde = %s, updated_at = %s 
                    WHERE numero_compte = %s
                """, [nouveau_solde_dest, timezone.now(), compte_dest])
                
                # 3. Créer transaction source (débit)
                import uuid
                ref_source = f"TRF-{uuid.uuid4().hex[:10].upper()}"
                cursor.execute("""
                    INSERT INTO transactions_transaction 
                    (reference, client_id, type_transaction, montant, description, 
                     statut, ancien_solde, nouveau_solde, effectue_par_id, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    ref_source,
                    client.id,
                    'TRANSFERT',
                    montant,
                    f"Transfert vers {compte_dest}. {description}",
                    'REUSSIE',
                    ancien_solde_source,
                    nouveau_solde_source,
                    None,  # Pas d'employé, c'est le client lui-même
                    timezone.now()
                ])
                
                # 4. Créer transaction destination (crédit)
                ref_dest = f"TRF-{uuid.uuid4().hex[:10].upper()}"
                cursor.execute("""
                    INSERT INTO transactions_transaction 
                    (reference, client_id, type_transaction, montant, description, 
                     statut, ancien_solde, nouveau_solde, effectue_par_id, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    ref_dest,
                    serializer.compte_dest_data['id'],
                    'TRANSFERT',
                    montant,
                    f"Transfert reçu de {client.numero_compte} - {client.nom_complet}. {description}",
                    'REUSSIE',
                    ancien_solde_dest,
                    nouveau_solde_dest,
                    None,
                    timezone.now()
                ])
                
                # Valider la transaction
                cursor.execute("COMMIT")
            
            return Response({
                'status': 'success',
                'message': f'Transfert de {montant} USD effectué avec succès',
                'data': {
                    'reference': ref_source,
                    'montant': str(montant),
                    'compte_dest': compte_dest,
                    'beneficiaire': serializer.compte_dest_data['nom'],
                    'ancien_solde': str(ancien_solde_source),
                    'nouveau_solde': str(nouveau_solde_source),
                    'date': timezone.now().isoformat()
                }
            })
            
        except Exception as e:
            # Annuler en cas d'erreur
            with connection.cursor() as cursor:
                cursor.execute("ROLLBACK")
            
            return Response({
                'status': 'error',
                'message': f'Erreur lors du transfert : {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)