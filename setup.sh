#!/bin/bash

# Thoát nếu có lỗi xảy ra
set -e

echo "==========================================="
echo "   Cài đặt và Khởi chạy Bot World Cup 2026 "
echo "==========================================="

# 1. Kiểm tra môi trường
if ! command -v git &> /dev/null; then
    echo "Lỗi: Git chưa được cài đặt. Vui lòng cài đặt Git và thử lại."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Lỗi: Node.js chưa được cài đặt. Vui lòng cài đặt Node.js và thử lại."
    exit 1
fi

# 2. Tải và giải nén dự án
REPO_DIR="bot_wc_2026-main"
if [ -d "$REPO_DIR" ]; then
    echo "-> Thư mục $REPO_DIR đã tồn tại."
    cd "$REPO_DIR"
else
    echo "-> Đang tải source code dạng ZIP từ GitHub..."
    curl -L https://github.com/thucho0103/bot_wc_2026/archive/refs/heads/main.zip -o bot_wc_2026.zip
    
    if ! command -v unzip &> /dev/null; then
        echo "Lỗi: Không tìm thấy lệnh 'unzip'. Vui lòng cài đặt unzip và thử lại."
        exit 1
    fi
    
    unzip -q bot_wc_2026.zip
    rm bot_wc_2026.zip
    cd "$REPO_DIR"
fi

# 3. Cài đặt Node modules
echo "-> Đang cài đặt thư viện..."
npm install

# 4. Cấu hình file .env
if [ ! -f .env ]; then
    echo ""
    echo "--- CẤU HÌNH TOKEN BẢO MẬT ---"
    read -p "1. Nhập DISCORD_TOKEN: " discord_token
    read -p "2. Nhập CLIENT_ID: " client_id
    read -p "3. Nhập THE_ODDS_API_KEY: " odds_key
    echo ""

    cat <<EOF > .env
DISCORD_TOKEN=$discord_token
CLIENT_ID=$client_id
GUILD_ID=
LIVE_CHANNEL_ID=
UPDATE_INTERVAL=60000
TIMEZONE=UTC+7

# The Odds API Configuration (Get a free key from the-odds-api.com)
THE_ODDS_API_KEY=$odds_key
THE_ODDS_REGION=us
EOF
    echo "-> Đã cấu hình xong file .env!"
else
    echo "-> File .env đã tồn tại, bỏ qua bước nhập cấu hình."
fi

# 5. Chạy dự án
echo "-> Đang khởi chạy bot..."
npm start
