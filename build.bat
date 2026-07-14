@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   AutoPrint - Standalone EXE Build Scripti
echo ============================================
echo.

:: Proje kök dizinini al
set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

:: -------- ADIM 1: Frontend bağımlılıkları --------
echo [1/6] Frontend bagimliliklar yukleniyor...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo HATA: Frontend npm install basarisiz oldu!
    goto :error
)

:: -------- ADIM 2: Frontend derleme --------
echo.
echo [2/6] Frontend React uygulamasi derleniyor...
call npm run build
if %errorlevel% neq 0 (
    echo HATA: Frontend build basarisiz oldu!
    goto :error
)
echo Frontend basariyla derlendi: frontend\dist\

:: -------- ADIM 3: Backend bağımlılıkları --------
echo.
echo [3/6] Backend bagimliliklar yukleniyor...
cd /d "%ROOT_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo HATA: Backend npm install basarisiz oldu!
    goto :error
)

:: -------- ADIM 4: pkg yükle --------
echo.
echo [4/6] pkg paketleyici kontrol ediliyor...
call npx pkg --version >nul 2>&1
if %errorlevel% neq 0 (
    echo pkg yuklenmiyor, yukleniyor...
    call npm install pkg --save-dev
    if %errorlevel% neq 0 (
        echo HATA: pkg yuklenemedi!
        goto :error
    )
)

:: -------- ADIM 5: dist klasörü hazırla --------
echo.
echo [5/6] dist klasoru hazirlaniyor...
if not exist dist mkdir dist
if exist dist\public (
    echo Eski frontend dosyalari temizleniyor...
    rmdir /s /q dist\public 2>nul
)
mkdir dist\public 2>nul

echo Frontend dosyalari kopyalaniyor: frontend\dist -> dist\public\
robocopy "%ROOT_DIR%frontend\dist" "%ROOT_DIR%dist\public" /E /NFL /NDL /NJH /NJS
if %errorlevel% GEQ 8 (
    echo HATA: Dosya kopyalama basarisiz oldu!
    goto :error
)

echo pdfkit AFM font dosyalari kopyalaniyor...
if exist "%ROOT_DIR%dist\pdfkit-data" rmdir /s /q "%ROOT_DIR%dist\pdfkit-data" 2>nul
mkdir "%ROOT_DIR%dist\pdfkit-data" 2>nul
copy /Y "%ROOT_DIR%node_modules\pdfkit\js\data\*.afm" "%ROOT_DIR%dist\pdfkit-data\" > nul
if %errorlevel% neq 0 (
    echo HATA: AFM font dosyalari kopyalanamadi!
    goto :error
)
echo AFM font dosyalari kopyalandi.

echo SumatraPDF yazici motoru kopyalaniyor...
if exist "%ROOT_DIR%dist\sumatra" rmdir /s /q "%ROOT_DIR%dist\sumatra" 2>nul
mkdir "%ROOT_DIR%dist\sumatra" 2>nul
copy /Y "%ROOT_DIR%node_modules\pdf-to-printer\dist\*.exe" "%ROOT_DIR%dist\sumatra\" > nul
if %errorlevel% neq 0 (
    echo HATA: SumatraPDF kopyalanamadi!
    goto :error
)
echo SumatraPDF kopyalandi.

echo printer.txt yazici ayar dosyasi kopyalaniyor...
if not exist "%ROOT_DIR%dist\printer.txt" (
    copy /Y "%ROOT_DIR%printer.txt" "%ROOT_DIR%dist\printer.txt" > nul
)
echo printer.txt hazir.

:: -------- ADIM 6: EXE oluştur --------
echo.
echo [6/6] EXE olusturuluyor (bu biraz zaman alabilir)...
call npx pkg src/standalone.js --targets node18-win-x64 --output dist/autoprint.exe
if %errorlevel% neq 0 (
    echo HATA: EXE olusturma basarisiz oldu!
    goto :error
)

:: -------- Başarı --------
echo.
echo ============================================
echo   BUILD BASARILI!
echo ============================================
echo.
echo Olusturulan dosyalar:
echo   dist\autoprint.exe   - Calistirilabilir uygulama
echo   dist\public\         - Frontend dosyalari (exe yaninda olmali)
echo   dist\pdfkit-data\    - PDF font dosyalari (exe yaninda olmali)
echo   dist\sumatra\        - SumatraPDF yazici motoru (exe yaninda olmali)
echo   dist\printer.txt     - Yazici adi ayar dosyasi (exe yaninda olmali)
echo.
echo Calistirmak icin:
echo   dist\autoprint.exe
echo.
echo Tarayicide acin:
echo   http://localhost:3001
echo.
echo NOT: dist\ klasorunu tasimayin. autoprint.exe, public\, pdfkit-data\,
echo      sumatra\ ve printer.txt her zaman ayni dizinde olmalidir.
echo      Belirli bir yaziciya basmak icin dist\printer.txt dosyasina
echo      yazicinin tam adini yazin (bos birakilirsa varsayilan yazici kullanilir).
echo.
goto :end

:error
echo.
echo ============================================
echo   BUILD BASARISIZ OLDU!
echo ============================================
echo Yukaridaki hata mesajina bakin.
echo.
pause
exit /b 1

:end
pause
