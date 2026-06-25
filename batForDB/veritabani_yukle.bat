@echo off
chcp 65001 > nul
echo ===================================================
echo      Gem Mekatronik - PLC Veritabanı Kurulumu
echo ===================================================

set CONTAINER_NAME=plc_database
set DB_USER=plcuser
set DB_PASS=plcpass123
set DB_NAME=plc_readings
set DB_PORT=5432
set BACKUP_FILE=veritabani.sql

:: 1. Yedek Dosyası Kontrolü
if not exist %BACKUP_FILE% (
    echo [HATA] %BACKUP_FILE% bulunamadı! 
    echo Lütfen bu bat dosyası ile yedeğinizi yan yana koyun.
    pause
    exit /b
)

:: 2. Çakışma Önleme (Eski container varsa siler)
docker ps -a --format "{{.Names}}" | findstr /I "^%CONTAINER_NAME%$" > nul
if %errorlevel% equ 0 (
    echo [-] Aynı isimde bir container bulundu. Yeniden oluşturulması için kaldırılıyor...
    docker stop %CONTAINER_NAME% > nul 2>&1
    docker rm %CONTAINER_NAME% > nul 2>&1
)

:: 3. Docker Container Oluşturma (Tek Satır Hali)
echo [+] %CONTAINER_NAME% container'ı başlatılıyor...
echo İmaj: postgres:15-alpine , Port: %DB_PORT% , DB: %DB_NAME%
echo ---------------------------------------------------

docker run --name %CONTAINER_NAME% -e POSTGRES_USER=%DB_USER% -e POSTGRES_PASSWORD=%DB_PASS% -e POSTGRES_DB=%DB_NAME% -p %DB_PORT%:5432 --restart always -d postgres:15-alpine

if %errorlevel% neq 0 (
    echo [HATA] Docker container oluşturulamadı! Docker Desktop'ın açık olduğundan emin olun.
    pause
    exit /b
)

:: 4. Sağlık Kontrolü (Veritabanının hazır olmasını bekler)
echo [+] Veritabanı servisinin hazır olması bekleniyor...
:WAIT_LOOP
timeout /t 2 /nobreak > nul
docker exec %CONTAINER_NAME% pg_isready -U %DB_USER% -d %DB_NAME% > nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Veritabanı henüz bağlantı kabul etmiyor, bekleniyor...
    goto WAIT_LOOP
)

echo [+] Veritabanı hazır. Eski veriler aktarılıyor (Restore)...
echo ---------------------------------------------------

:: 5. SQL Yedeğini plc_readings Veritabanına Aktarma
docker exec -i %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% < %BACKUP_FILE%

if %errorlevel% equ 0 (
    echo ===================================================
    echo [BAŞARILI] Container kuruldu ve yedek başarıyla yüklendi!
    echo Port: %DB_PORT% ve DB: %DB_NAME% aktiftir.
    echo ===================================================
) else (
    echo [HATA] Veri aktarımı sırasında bir sorun oluştu.
)

pause