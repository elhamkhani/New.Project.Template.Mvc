@echo off

ECHO Checking bower is installed globally...

REM --- Make sure bower is installed globally
where bower > nul
if ERRORLEVEL 1 (
	echo Installing bower globally...
	npm install bower -g	
)

ECHO Running NPM
call npm install

ECHO Running BOWER
call bower install

ECHO Running Gulp to generate Css files
call node_modules\.bin\gulp less-to-css


ECHO Running Gulp to update fonts
call node_modules\.bin\gulp fonts
