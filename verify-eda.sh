#!/bin/bash

# 🔍 EDA COMPONENT VERIFICATION SCRIPT
# This script verifies which EDA component is being used

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 EDA COMPONENT VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ Checking App.tsx import..."
grep "ExploratoryDataAnalysis" src/app/App.tsx
echo ""

echo "✅ Checking App.tsx usage..."
grep "case 'eda'" src/app/App.tsx
echo ""

echo "✅ Checking if Real component exists..."
if [ -f "src/app/components/ExploratoryDataAnalysisReal.tsx" ]; then
    echo "✅ ExploratoryDataAnalysisReal.tsx EXISTS"
    echo "   First line check:"
    head -n 5 src/app/components/ExploratoryDataAnalysisReal.tsx | grep "REAL EDA"
else
    echo "❌ ExploratoryDataAnalysisReal.tsx NOT FOUND"
fi
echo ""

echo "✅ Checking edaApi service..."
if [ -f "src/services/edaApi.ts" ]; then
    echo "✅ edaApi.ts EXISTS"
    echo "   Base URL:"
    grep "BASE_URL" src/services/edaApi.ts | head -1
else
    echo "❌ edaApi.ts NOT FOUND"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all checks passed, the Real API component IS configured."
echo "If you're still seeing mock data:"
echo ""
echo "  1. RESTART your React app (npm run dev)"
echo "  2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  3. Clear browser cache"
echo "  4. Check browser console for debug message:"
echo "     '🔥 ExploratoryDataAnalysisReal MOUNTED'"
echo ""
