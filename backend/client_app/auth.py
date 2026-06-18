# client_app/auth.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.db import connection


class ClientUser:
    """
    Représente un client connecté (n'est pas un vrai modèle Django User).
    """
    def __init__(self, client_data):
        self.id = client_data.get('id')
        self.numero_compte = client_data.get('numero_compte')
        self.nom = client_data.get('nom')
        self.post_nom = client_data.get('post_nom')
        self.prenom = client_data.get('prenom')
        self.email = client_data.get('email')
        self.telephone = client_data.get('telephone')
        self.solde = client_data.get('solde')
        self.devise = client_data.get('devise')
        self.type_compte = client_data.get('type_compte')
        self.statut = client_data.get('statut')
        self.is_authenticated = True
        self.is_active = True
    
    @property
    def nom_complet(self):
        return f"{self.nom} {self.post_nom} {self.prenom}"
    
    def __str__(self):
        return f"{self.nom_complet} - {self.numero_compte}"


class ClientJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT personnalisée pour les clients.
    Utilise le modèle Client de la base de données partagée.
    """
    
    def get_user(self, validated_token):
        """
        Récupère le client depuis la base de données en utilisant le numero_compte.
        """
        try:
            numero_compte = validated_token.get('numero_compte')
            
            if not numero_compte:
                raise InvalidToken('Token invalide : numero_compte manquant')
            
            # Requête MySQL
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        id, numero_compte, nom, post_nom, prenom,
                        email, telephone, solde, devise, type_compte, statut
                    FROM clients_client 
                    WHERE numero_compte = %s 
                    AND statut = 'ACTIF'
                """, [numero_compte])
                
                row = cursor.fetchone()
                
                if not row:
                    raise AuthenticationFailed('Client non trouvé ou compte inactif')
                
                columns = [
                    'id', 'numero_compte', 'nom', 'post_nom', 'prenom',
                    'email', 'telephone', 'solde', 'devise', 'type_compte', 'statut'
                ]
                
                client_data = dict(zip(columns, row))
                return ClientUser(client_data)
                
        except AuthenticationFailed:
            raise
        except Exception as e:
            raise AuthenticationFailed(f'Erreur d\'authentification : {str(e)}')