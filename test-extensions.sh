#!/bin/bash

echo "=== Testing PHP Extension Detection ==="
echo

echo "Available PHP extensions:"
php -m | grep -E "(PDO|pdo|mysql|mbstring)" | sort

echo
echo "Testing detection logic:"

# Test PDO detection
if php -m | grep -qi "^PDO$" || php -m | grep -qi "^pdo$"; then
    echo "✅ PDO: DETECTED"
else
    echo "❌ PDO: NOT DETECTED"
fi

# Test pdo_mysql detection  
if php -m | grep -qi "^pdo_mysql$"; then
    echo "✅ pdo_mysql: DETECTED"
else
    echo "❌ pdo_mysql: NOT DETECTED"
fi

# Test other extensions
for ext in mbstring xml bcmath json ctype fileinfo tokenizer; do
    if php -m | grep -qi "^$ext$"; then
        echo "✅ $ext: DETECTED"
    else
        echo "❌ $ext: NOT DETECTED"
    fi
done

echo
echo "=== Extension Test Complete ==="
