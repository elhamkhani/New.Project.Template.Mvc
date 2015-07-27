

UPDATEING PACKAGES
===========================

If you change the following files: 

	- bower.json
	- package.json

The you should:

	1: right click on the Website in Solution explorer and  then "Open Folder in File Explorer".
	2: Click somewhere empty on the folder, Shift + Right click , Open Command Line Here
	3: Type Build\Update-Packages.bat




PREPARING FOR RELEASE
=======================================

When you are ready to deploy, or want to test the bundling of resources (for performance), then:
 
	1: Do the same steps as above to run Prepare-Release.bat file.
	2: Update web.config and set <compilation debug="false"/>.