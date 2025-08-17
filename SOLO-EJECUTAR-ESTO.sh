#!/bin/bash

echo "🚀 COPILOTO PDF - SOLO EJECUTAR ESTO"
echo "===================================="
echo ""
echo "Este script solucionará TODO automáticamente:"
echo "✅ Problemas de Docker"
echo "✅ Problemas de dependencias"
echo "✅ Problemas de configuración"
echo "✅ Problemas de puertos"
echo "✅ Problemas de cache"
echo ""
echo "¿Quieres continuar? (s/n)"
read -r response

if [[ "$response" =~ ^[Ss]$ ]]; then
    echo ""
    echo "🤖 Ejecutando AUTO-FIX..."
    ./auto-fix.sh
else
    echo "❌ Cancelado"
    exit 1
fi
