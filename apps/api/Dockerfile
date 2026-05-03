FROM php:8.2-apache

# PostgreSQLに接続するための拡張機能（pdo_pgsql）をインストール
RUN apt-get update && apt-get install -y \
    git \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# APIのルーティングを綺麗にするためのApache設定（mod_rewrite）を有効化
RUN a2enmod rewrite

# composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer