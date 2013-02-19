// GRS Plugin Wiz  Ver 1.0
// Copyright (C) CDYW Corporation. All rights reserved.
//
// This file is a part of the GRS Library.
// The use and distribution terms for this software are covered by the
// Common Public License 1.0 (http://opensource.org/osi3.0/licenses/cpl1.0.php)
// which can be found in the file CPL.TXT at the root of this distribution.
// By using this software in any fashion, you are agreeing to be bound by
// the terms of this license. You must not remove this notice, or
// any other, from this software.

// Setup program for the  GRS Plugin Wizard for VC++ 9.0 (Whidbey)
function setupPlugin()
{
	// Decode command line arguments
	var bDebug = false;
	var bElevated = false;
	var Args = WScript.Arguments;
	for(var i = 0; i < Args.length; i++)
	{
		if(Args(i) == "/debug")
			bDebug = true;
		else if(Args(i) == "/elevated")
			bElevated = true;
	}

	// See if UAC is enabled
	var Shell = WScript.CreateObject("Shell.Application");
	if(!bElevated && Shell.IsRestricted("System", "EnableLUA"))
	{
		// Check that the script is being run interactively.
		if(!WScript.Interactive)
		{
			WScript.Echo("ERROR: Elevation required.");
			return;
		}
		
		// Now relaunch the script, using the "RunAs" verb to elevate
		var strParams = "\"" + WScript.ScriptFullName + "\"";
		if (bDebug)
			strParams += " /debug";
		strParams += " /elevated";
		Shell.ShellExecute(WScript.FullName, strParams, null, "RunAs");
		return;
	}
	
	// Create shell object
	var WSShell = WScript.CreateObject("WScript.Shell");
	// Create file system object
	var FileSys = WScript.CreateObject("Scripting.FileSystemObject");

	// Get the folder containing the script file
	var strValue = FileSys.GetParentFolderName(WScript.ScriptFullName);
	if(strValue == null || strValue == "")
		strValue = ".";	
	// 获取数据源路径
	var strSourceFolder = FileSys.BuildPath(strValue, "yuxpcomwiz");
	if(bDebug)
		WScript.Echo("Source: " + strSourceFolder);

	if(!FileSys.FolderExists(strSourceFolder))
	{
		WScript.Echo("ERROR: Cannot find Wizard folder (should be: " + strSourceFolder + ")");
		return;
	}

	try
	{
		var strVC10Key = "HKLM\\Software\\Microsoft\\VisualStudio\\10.0\\Setup\\VC\\ProductDir";
		strValue = WSShell.RegRead(strVC10Key);
	}
	catch(e)
	{
		try
		{
			var strVC10Key_x64 = "HKLM\\Software\\Wow6432Node\\Microsoft\\VisualStudio\\10.0\\Setup\\VC\\ProductDir";
			strValue = WSShell.RegRead(strVC10Key_x64);
		}
		catch(e)
		{
			WScript.Echo("ERROR: Cannot find where Visual Studio 10.0 is installed.");
			return;
		}
	}

	var strDestFolder = FileSys.BuildPath(strValue, "vcprojects");
	if(bDebug)
		WScript.Echo("Destination: " + strDestFolder);
	if(!FileSys.FolderExists(strDestFolder))
	{
		WScript.Echo("ERROR: Cannot find destination folder (should be: " + strDestFolder + ")");
		return;
	}

	// Copy files
	try
	{
		// Create xpcom plugin wiz
		var strSrc = FileSys.BuildPath(strSourceFolder, "xpcomComponentWizard.ico");
		var strDest = FileSys.BuildPath(strDestFolder, "xpcomComponentWizard.ico");
		FileSys.CopyFile(strSrc, strDest);

		strSrc = FileSys.BuildPath(strSourceFolder, "xpcomComponentWizard.vsdir");
		strDest = FileSys.BuildPath(strDestFolder, "xpcomComponentWizard.vsdir");
		FileSys.CopyFile(strSrc, strDest);
	}
	catch(e)
	{
		var strError = "no info";
		if(e.description.length != 0)
			strError = e.description;
		WScript.Echo("ERROR: Cannot copy file (" + strError + ")");
		return;
	}

	// Read and write GRSPlugin.vsz, add engine version and replace path when found
	try
	{
		var strSrc = FileSys.BuildPath(strSourceFolder, "xpcomComponentWizard.vsz");
		var strDest = FileSys.BuildPath(strDestFolder, "xpcomComponentWizard.vsz");

		var ForReading = 1;
		var fileSrc = FileSys.OpenTextFile(strSrc, ForReading);
		if(fileSrc == null)
		{
			WScript.Echo("ERROR: Cannot open source file " + strSrc);
			return;
		}

		var ForWriting = 2;
		var fileDest = FileSys.OpenTextFile(strDest, ForWriting, true);
		if(fileDest == null)
		{
			WScript.Echo("ERROR: Cannot open destination file" + strDest);
			return;
		}

		while(!fileSrc.AtEndOfStream)
		{
			var strLine = fileSrc.ReadLine();
			if(strLine.indexOf("Wizard=VsWizard.VsWizardEngine") != -1)
				strLine += ".10.0";
			else if(strLine.indexOf("WIZARD_VERSION") != -1)
				strLine = "Param=\"WIZARD_VERSION = 10.0\"";
			else if(strLine.indexOf("ABSOLUTE_PATH") != -1)
				strLine = "Param=\"ABSOLUTE_PATH = " + strSourceFolder + "\"";
			fileDest.WriteLine(strLine);
		}

		fileSrc.Close();
		fileDest.Close();
	}
	catch(e)
	{
		var strError = "no info";
		if(e.description.length != 0)
			strError = e.description;
		WScript.Echo("ERROR: Cannot read and write GRSPlugins.vsz (" + strError + ")");
		return;
	}
	
	
	// Create yuXPCOM folder
	var strDestGRSFolder = "";
	try
	{
		strDestGRSFolder = FileSys.BuildPath(strDestFolder, "yuXPCOMWiz");
		if(!FileSys.FolderExists(strDestGRSFolder))
			FileSys.CreateFolder(strDestGRSFolder);
		if(bDebug)
			WScript.Echo("yuXPCOMWiz Folder: " + strDestGRSFolder);
	}
	catch(e)
	{
		var strError = "no info";
		if(e.description.length != 0)
			strError = e.description;
		WScript.Echo("ERROR: Cannot create yuXPCOMWiz folder (" + strError + ")");
		return;
	}

	// Read and write additional GRSAppWiz.vsdir, add path to the wizard location
	try
	{
		var strSrc = FileSys.BuildPath(strSourceFolder, "xpcomComponentWizard.vsdir");
		var strDest = FileSys.BuildPath(strDestGRSFolder, "xpcomComponentWizard.vsdir");

		var ForReading = 1;
		var fileSrc = FileSys.OpenTextFile(strSrc, ForReading);
		if(fileSrc == null)
		{
			WScript.Echo("ERROR: Cannot open source file " + strSrc);
			return;
		}

		var ForWriting = 2;
		var fileDest = FileSys.OpenTextFile(strDest, ForWriting, true);
		if(fileDest == null)
		{
			WScript.Echo("ERROR: Cannot open destination file" + strDest);
			return;
		}

		while(!fileSrc.AtEndOfStream)
		{
			var strLine = fileSrc.ReadLine();
			if(strLine.indexOf("xpcomComponentWizard.vsz|") != -1)
				strLine = "..\\" + strLine;
			fileDest.WriteLine(strLine);
		}

		fileSrc.Close();
		fileDest.Close();
	}
	catch(e)
	{
		var strError = "no info";
		if(e.description.length != 0)
			strError = e.description;
		WScript.Echo("ERROR: Cannot read and write xpCOM\\xpcomComponentWizard.vsdir (" + strError + ")");
		return;
	}

	WScript.Echo("XPCOM Component Wizard install success! ");
}
