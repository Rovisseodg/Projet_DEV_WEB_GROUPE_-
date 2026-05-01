<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MaMutuelle - Bienvenue</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
        }
        h1 {
            color: #0066CC;
            font-size: 3em;
            margin-bottom: 20px;
        }
        .subtitle {
            color: #00AA55;
            font-size: 1.3em;
            margin-bottom: 40px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 10px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background-color: #0066CC;
            color: white;
        }
        .btn-primary:hover {
            background-color: #0052A3;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background-color: #00AA55;
            color: white;
        }
        .btn-secondary:hover {
            background-color: #008844;
            transform: translateY(-2px);
        }
        .status {
            margin-top: 60px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .status h2 {
            color: #0066CC;
            margin-bottom: 15px;
        }
        .status-item {
            padding: 10px;
            margin: 5px 0;
            background: #f5f5f5;
            border-left: 4px solid #00AA55;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 MaMutuelle</h1>
        <p class="subtitle">Système de Gestion de Mutuelle</p>
        
        <div>
            <a href="/api" class="button btn-primary">API Backend</a>
            <a href="/frontend" class="button btn-secondary">Frontend</a>
        </div>

        <div class="status">
            <h2>✅ État du Système</h2>
            <div class="status-item">
                ✓ Backend Laravel en fonctionnement
            </div>
            <div class="status-item">
                ✓ Base de données PostgreSQL connectée
            </div>
            <div class="status-item">
                ✓ Serveur développement actif sur http://localhost:8000
            </div>
            <div class="status-item">
                📝 Prêt à recevoir les requêtes API
            </div>
        </div>
    </div>
</body>
</html>
