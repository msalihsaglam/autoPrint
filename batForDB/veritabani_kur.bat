@echo off
chcp 65001 > nul
echo ===================================================
echo      PostgreSQL Veritabanı Yükleme (Süper Kullanıcı ile)
echo ===================================================

set DB_USER=postgres
set DB_PASS=postgres  :: BURAYA POSTGRES KURARKEN BELİRLEDİĞİNİZ ŞİFREYİ YAZIN
set DB_NAME=plc_readings
set BACKUP_FILE=veritabani.sql
set PG_BIN_PATH=C:\Program Files\PostgreSQL\18\bin

set PGPASSWORD=%DB_PASS%

echo [+] Veritabanı yapısı hazırlanıyor...
"%PG_BIN_PATH%\psql.exe" -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" 2>nul

echo [+] Veriler %BACKUP_FILE% dosyasından aktarılıyor...
:: -U postgres ile yetki hatasını aşmış olacağız
"%PG_BIN_PATH%\psql.exe" -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%"

set PGPASSWORD=
echo ---------------------------------------------------
echo [TAMAM] İşlem başarıyla tamamlandı.
pause