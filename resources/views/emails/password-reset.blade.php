<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Cash Management System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #4a5568;
            line-height: 1.7;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        .warning {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #c53030;
        }
        .footer {
            background-color: #f7fafc;
            padding: 20px 40px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .expiry {
            background-color: #ebf8ff;
            border: 1px solid #bee3f8;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #2b6cb0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💰 Cash Management</div>
            <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{ $user->name }},</div>
            
            <div class="message">
                You are receiving this email because we received a password reset request for your account in the Cash Management System.
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $url }}" class="button">Reset Password</a>
            </div>
            
            <div class="expiry">
                <strong>⚠️ Important:</strong> This password reset link will expire in 60 minutes for security reasons.
            </div>
            
            <div class="warning">
                <strong>🔒 Security Notice:</strong> If you did not request a password reset, please ignore this email. Your password will remain unchanged.
            </div>
            
            <div class="message">
                If you're having trouble clicking the "Reset Password" button, copy and paste the following URL into your web browser:
                <br><br>
                <a href="{{ $url }}" style="color: #667eea; word-break: break-all;">{{ $url }}</a>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent from the Cash Management System.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; {{ date('Y') }} Cash Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
