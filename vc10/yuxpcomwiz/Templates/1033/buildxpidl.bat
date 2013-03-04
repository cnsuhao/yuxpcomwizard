@echo off
cd %~dp0

REM [!output YU_COMP_NAME] Component interface


python %XPCOM_SDK%\sdk\bin\typelib.py --cachedir=./cache -I %XPCOM_SDK%\idl -o %2 %1
python %XPCOM_SDK%\sdk\bin\header.py --cachedir=./cache -I %XPCOM_SDK%\idl -o %3 %1

