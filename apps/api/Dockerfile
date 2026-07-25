FROM composer:2 AS dependencies

WORKDIR /app
COPY composer.json composer.lock* ./
COPY src ./src
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --ignore-platform-req=ext-pdo_pgsql \
    --classmap-authoritative

FROM php:8.4-apache AS runtime

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.0 \
    /lambda-adapter /opt/extensions/lambda-adapter

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pcntl pdo_pgsql \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public \
    AWS_LWA_PORT=8080 \
    AWS_LWA_READINESS_CHECK_PATH=/health \
    AWS_LWA_ENABLE_COMPRESSION=true

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/portfolio.ini
RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf

WORKDIR /var/www/html
COPY --from=dependencies /app/vendor ./vendor
COPY . .

RUN php -m | grep -q '^pcntl$' \
    && php -m | grep -q '^pdo_pgsql$' \
    && chown -R www-data:www-data /var/www/html

ENTRYPOINT ["php", "/var/www/html/docker/entrypoint.php"]
CMD ["apache2-foreground"]

EXPOSE 8080
