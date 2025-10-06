#!/bin/bash

echo "🔧 ALEXIA - Authentication Debug Tool"
echo "===================================="

echo -e "\n1️⃣  Checking current authentication state..."

# Check if there's a token in localStorage via API call
echo "Checking for stored authentication tokens..."
TOKEN_CHECK=$(curl -s -X GET http://localhost:3001/api/auth/me \
    -H "Authorization: Bearer test" 2>/dev/null | head -1)

echo "API Response: $TOKEN_CHECK"

echo -e "\n2️⃣  Creating token clearing script..."

# Create a comprehensive clearing script
cat > /tmp/force_clear_auth.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Force Clear Authentication</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Authentication Debug Tool</h1>

        <div id="status" class="status info">
            Checking authentication state...
        </div>

        <button onclick="checkAuth()">Check Authentication</button>
        <button onclick="clearAuth()">Force Clear Authentication</button>
        <button onclick="testLogin()">Test Login Flow</button>

        <div id="results" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; font-family: monospace; white-space: pre-wrap;"></div>
    </div>

    <script>
        function log(message) {
            const results = document.getElementById('results');
            results.textContent += new Date().toLocaleTimeString() + ': ' + message + '\n';
        }

        function checkAuth() {
            log('🔍 Checking current authentication state...');

            const token = localStorage.getItem('auth_token');
            const user = localStorage.getItem('user');

            log('Token exists: ' + (token ? 'YES (' + token.substring(0, 20) + '...)' : 'NO'));
            log('User data exists: ' + (user ? 'YES' : 'NO'));

            if (token) {
                log('⚠️  Found existing token - this explains why you see dashboard directly');
            } else {
                log('✅ No token found - login screen should appear');
            }

            updateStatus('Authentication state checked. ' +
                        (token ? 'Token found - will go to dashboard.' : 'No token - will show login.'));
        }

        function clearAuth() {
            log('🧹 Clearing all authentication data...');

            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            sessionStorage.clear();

            log('✅ Cleared localStorage and sessionStorage');

            // Also clear any cookies
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });

            log('✅ Cleared cookies');

            updateStatus('✅ All authentication data cleared. Refresh the page to test login flow.');
        }

        function testLogin() {
            log('🔗 Opening login test page...');
            window.open('http://localhost:3000', '_blank');
        }

        function updateStatus(message) {
            document.getElementById('status').textContent = message;
            document.getElementById('status').className = 'status success';
        }

        // Auto-check on load
        window.onload = function() {
            setTimeout(checkAuth, 500);
        };
    </script>
</body>
</html>
EOF

echo ""
echo "🔗 Step 3: Open this debug tool in your browser:"
echo "file:///tmp/force_clear_auth.html"
echo ""
echo "📋 Instructions:"
echo "1. Open the debug tool above in your browser"
echo "2. Click 'Check Authentication' to see current state"
echo "3. Click 'Force Clear Authentication' to clear all stored tokens"
echo "4. Click 'Test Login Flow' to open the application"
echo ""
echo "This will definitively clear any stored authentication tokens."
