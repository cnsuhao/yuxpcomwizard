cd %~dp0

REM [!output YU_COMP_NAME] Component interface

python %XPCOM_SDK%\sdk\bin\typelib.py --cachedir=./cache -I %XPCOM_SDK%\idl -o ../../bin/components/[!output YU_INTERFACE_NAME].xpt [!output YU_INTERFACE_NAME].idl
python %XPCOM_SDK%\sdk\bin\header.py --cachedir=./cache -I %XPCOM_SDK%\idl -o ../include/[!output YU_INTERFACE_NAME].h [!output YU_INTERFACE_NAME].idl

