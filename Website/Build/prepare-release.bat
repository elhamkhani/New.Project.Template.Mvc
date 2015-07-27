@echo off
ECHO Running GULP Prepare-Release

call node_modules\.bin\gulp prepare-release

echo PostBuild finished
:done