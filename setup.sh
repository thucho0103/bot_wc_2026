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

# 2. Clone dự án
REPO_DIR="bot_wc_2026"
if [ -d "$REPO_DIR" ]; then
    echo "-> Thư mục $REPO_DIR đã tồn tại. Đang cập nhật code mới nhất..."
    cd "$REPO_DIR"
    git pull
else
    echo "-> Đang tải source code từ GitHub..."
    git clone https://github.com/thucho0103/bot_wc_2026.git "$REPO_DIR"
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
