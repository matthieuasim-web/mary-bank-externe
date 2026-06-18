# client_app/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password
from django.db import connection

class ClientLoginSerializer(serializers.Serializer):
    """Connexion client avec numéro de compte et mot de passe"""
    numero_compte = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        numero_compte = data.get('numero_compte')
        password = data.get('password')
        
        # Chercher le client dans la base
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, numero_compte, nom, post_nom, prenom,
                    email, telephone, solde, devise, type_compte, 
                    statut, password, password_is_set
                FROM clients_client 
                WHERE numero_compte = %s
            """, [numero_compte])
            
            row = cursor.fetchone()
            
            if not row:
                raise serializers.ValidationError({
                    'numero_compte': 'Numéro de compte invalide.'
                })
            
            columns = [
                'id', 'numero_compte', 'nom', 'post_nom', 'prenom',
                'email', 'telephone', 'solde', 'devise', 'type_compte',
                'statut', 'password', 'password_is_set'
            ]
            
            client = dict(zip(columns, row))
        
        # Vérifications
        if client['statut'] != 'ACTIF':
            raise serializers.ValidationError({
                'numero_compte': f"Votre compte est {client['statut'].lower()}. Contactez votre conseiller."
            })
        
        if not client['password_is_set']:
            raise serializers.ValidationError({
                'password': 'Vous devez d\'abord définir votre mot de passe.'
            })
        
        if not check_password(password, client['password']):
            raise serializers.ValidationError({
                'password': 'Mot de passe incorrect.'
            })
        
        # Stocker les infos du client pour la vue
        self.client_data = client
        return data


class ClientSetPasswordSerializer(serializers.Serializer):
    """Définir le mot de passe pour la première fois"""
    numero_compte = serializers.CharField(max_length=20)
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)
    
    def validate_numero_compte(self, value):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, password_is_set, statut
                FROM clients_client 
                WHERE numero_compte = %s
            """, [value])
            
            row = cursor.fetchone()
            
            if not row:
                raise serializers.ValidationError("Aucun compte trouvé avec ce numéro.")
            
            if row[1]:  # password_is_set
                raise serializers.ValidationError("Le mot de passe est déjà défini. Connectez-vous.")
            
            if row[2] != 'ACTIF':
                raise serializers.ValidationError("Votre compte n'est pas encore activé.")
            
            self.client_id = row[0]
        
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Les mots de passe ne correspondent pas.'
            })
        return data
    
    def save(self):
        """Enregistre le mot de passe hashé"""
        hashed_password = make_password(self.validated_data['password'])
        
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE clients_client 
                SET password = %s, password_is_set = TRUE 
                WHERE id = %s
            """, [hashed_password, self.client_id])


class ClientProfileSerializer(serializers.Serializer):
    """Informations du profil client"""
    id = serializers.IntegerField(read_only=True)
    numero_compte = serializers.CharField(read_only=True)
    nom = serializers.CharField(read_only=True)
    post_nom = serializers.CharField(read_only=True)
    prenom = serializers.CharField(read_only=True)
    nom_complet = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True)
    telephone = serializers.CharField(read_only=True)
    solde = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    devise = serializers.CharField(read_only=True)
    type_compte = serializers.CharField(read_only=True)
    statut = serializers.CharField(read_only=True)
    
    def get_nom_complet(self, obj):
        return f"{obj.nom} {obj.post_nom} {obj.prenom}"


class TransactionSerializer(serializers.Serializer):
    """Historique des transactions du client"""
    reference = serializers.CharField()
    type_transaction = serializers.CharField()
    montant = serializers.DecimalField(max_digits=15, decimal_places=2)
    description = serializers.CharField()
    ancien_solde = serializers.DecimalField(max_digits=15, decimal_places=2)
    nouveau_solde = serializers.DecimalField(max_digits=15, decimal_places=2)
    created_at = serializers.DateTimeField()


class TransfertSerializer(serializers.Serializer):
    """Transfert d'argent entre deux comptes"""
    compte_dest = serializers.CharField(max_length=20)
    montant = serializers.DecimalField(max_digits=15, decimal_places=2)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    
    def validate_compte_dest(self, value):
        # Vérifier que le compte destination existe
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, statut, nom, post_nom, prenom
                FROM clients_client 
                WHERE numero_compte = %s
            """, [value])
            
            row = cursor.fetchone()
            
            if not row:
                raise serializers.ValidationError("Compte destination introuvable.")
            
            if row[1] != 'ACTIF':
                raise serializers.ValidationError("Le compte destination n'est pas actif.")
            
            self.compte_dest_data = {
                'id': row[0],
                'nom': f"{row[2]} {row[3]} {row[4]}"
            }
        
        return value
    
    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        if value > 50000:
            raise serializers.ValidationError("Le montant maximum par transfert est de 50,000 USD.")
        return value
    
    def validate(self, data):
        # Vérifier que ce n'est pas le même compte
        if self.context.get('numero_compte_source') == data['compte_dest']:
            raise serializers.ValidationError({
                'compte_dest': 'Impossible de transférer vers votre propre compte.'
            })
        
        # Vérifier le solde
        if self.context.get('solde', 0) < data['montant']:
            raise serializers.ValidationError({
                'montant': f"Solde insuffisant. Disponible : {self.context['solde']} USD"
            })
        
        return data