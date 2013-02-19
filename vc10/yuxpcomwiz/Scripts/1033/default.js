function OnFinish(selProj, selObj)
{
	try
	{
	    /// 增加符号 
	    //wizard.AddSymbol( "GRS_GUID_PLUGIN", CreateGUID() );
	
        //////////////////////////////////////////////////////////////////////////
		var strProjectPath = wizard.FindSymbol('PROJECT_PATH');
		var strProjectName = wizard.FindSymbol('PROJECT_NAME');

		//selProj = CreateCustomProject(strProjectName, strProjectPath);
		selProj = CreateProject(strProjectName, strProjectPath);
		selProj.Object.Keyword = "xpcomWizProj";
		
		
		AddConfig(selProj, strProjectName);
		
		AddFilters(selProj);
		
		AddGUID();

		var InfFile = CreateCustomInfFile();
		AddFilesToCustomProj(selProj, strProjectName, strProjectPath, InfFile);
		InfFile.Delete();

		selProj.Object.Save();
	}
	catch(e)
	{
		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function CreateCustomProject(strProjectName, strProjectPath)
{
	try
	{
		var strProjTemplatePath = wizard.FindSymbol('PROJECT_TEMPLATE_PATH');
		var strProjTemplate = '';
		strProjTemplate = strProjTemplatePath + '\\default.vcproj';

		var Solution = dte.Solution;
		var strSolutionName = "";
		if (wizard.FindSymbol("CLOSE_SOLUTION"))
		{
			Solution.Close();
			strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
			if (strSolutionName.length)
			{
				var strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
				Solution.Create(strSolutionPath, strSolutionName);
			}
		}

		var strProjectNameWithExt = '';
		strProjectNameWithExt = strProjectName + '.vcproj';

		var oTarget = wizard.FindSymbol("TARGET");
		var prj;
		
		//echo("12");
		//if (wizard.FindSymbol("WIZARD_TYPE") == vsWizardAddSubProject)  // vsWizardAddSubProject
		//{
			//echo("12");
		//	var prjItem = oTarget.AddFromTemplate(strProjTemplate, strProjectNameWithExt);
		//	prj = prjItem.SubProject;
		//}
		//else
		{
			prj = oTarget.AddFromTemplate(strProjTemplate, strProjectPath, strProjectNameWithExt);
		}
		
		return prj;
	}
	catch(e)
	{
		throw e;
	}
}

function AddFilters(proj)
{
	try
	{
		// Add the folders to your project
		var strSrcFilter = wizard.FindSymbol('SOURCE_FILTER');
		var group = proj.Object.AddFilter('Source Files');
		group.Filter = strSrcFilter;

		strSrcFilter = wizard.FindSymbol('INCLUDE_FILTER');
		group = proj.Object.AddFilter('Header Files');
		group.Filter = strSrcFilter;

		strSrcFilter = wizard.FindSymbol('RESOURCE_FILTER');
		group = proj.Object.AddFilter('Resource Files');
		group.Filter = strSrcFilter;
		
	}
	catch(e)
	{
		throw e;
	}
}
function AddConfig(proj, strProjectName)
{
	try
	{
		var useDLL = true;

		var nCntr;
		for(nCntr = 0; nCntr < 2; nCntr++)
		{
			// Check if it's Debug configuration
			var bDebug = false;
			if( nCntr == 0 )
				bDebug = true;

			// General settings
			var config;
			if(bDebug)
			{ 
				config = proj.Object.Configurations("Debug");
				config.ATLMinimizesCRunTimeLibraryUsage = false;
			}
			else
			{
				config = proj.Object.Configurations("Release");
				config.ATLMinimizesCRunTimeLibraryUsage = true;
			}
			
			config.IntermediateDirectory = "$(ConfigurationName)\\";
			config.OutputDirectory = "./bin/components/";
			config.CharacterSet = charSetUnicode;
			config.ConfigurationType  = typeDynamicLibrary;
			
			// Compiler settings
			var CLTool = config.Tools('VCCLCompilerTool');
			CLTool.RuntimeTypeInfo = true;
			//CLTool.TreatWChar_tAsBuiltInType = false;
			//CLTool.Detect64BitPortabilityProblems = true;
			CLTool.WarningLevel = warningLevel_3;
			CLTool.AdditionalIncludeDirectories = ".\\include;.\\interface;$(XPCOM_SDK)\\include"
			
			//var forcedIncludes = "stdafx.h;";
			//CLTool.ForcedIncludeFiles = forcedIncludes;

			CLTool.PrecompiledHeaderThrough = "stdafx.h";
			CLTool.PrecompiledHeaderFile = "$(IntDir)/$(TargetName).pch";
			CLTool.UsePrecompiledHeader = pchNone;
			//CLTool.UsePrecompiledHeader = pchCreateUsingSpecific;
			
			//CLTool.ExceptionHandling = true;
			
			if(bDebug)
			{
				CLTool.RuntimeLibrary = rtMultiThreadedDebugDLL;
				CLTool.MinimalRebuild = true;
				CLTool.DebugInformationFormat = debugEditAndContinue;
				CLTool.BasicRuntimeChecks = runtimeBasicCheckAll;
				CLTool.Optimization = optimizeDisabled;
			}
			else
			{
				CLTool.RuntimeLibrary = rtMultiThreadedDLL;
				CLTool.DebugInformationFormat = debugDisabled;
			}

			var strDefines = GetPlatformDefine(config);
			strDefines += "XPCOM_GLUE;XP_WIN;XP_WIN32;XPCOM_GLUE_USE_NSPR";
			if(bDebug)
			{
				strDefines += "_DEBUG;";
			}
			else
			{
				strDefines += "NDEBUG;";
			}
				
			strDefines += "_WINDOWS;";
			
			// 添加 Tinyxml++ 的预定义符号
			if(wizard.FindSymbol('GRS_USE_LIB_TINYXML'))
			{
				strDefines += "TIXML_USE_TICPP;"
			}
			
			strDefines += "_CRT_SECURE_NO_DEPRECATE;"
			
			CLTool.PreprocessorDefinitions = strDefines;
	
			// Linker settings
			var LinkTool = config.Tools('VCLinkerTool');

			LinkTool.SubSystem = subSystemWindows;
			LinkTool.TargetMachine = machineX86;
			
			var additionalDepends = "";
			if(bDebug)
			{
				LinkTool.LinkIncremental = linkIncrementalYes;
				LinkTool.GenerateDebugInformation = true;
			}
			else
			{
				LinkTool.LinkIncremental = linkIncrementalNo;
			}
			additionalDepends += "nspr4.lib xpcom.lib xpcomglue_s_nomozalloc.lib";
			
			if(wizard.FindSymbol('GRS_USE_LIB_TINYXML'))
			{
				additionalDepends += " tinyxml++.lib"
			}
			
			LinkTool.AdditionalDependencies = additionalDepends;
			LinkTool.AdditionalLibraryDirectories = "$(XPCOM_SDK)\\lib";
		
			// As of VC8, manifests are used with executables to inform the operating system of its DLL dependencies
			// This covers ATL, MFC, Standard C++, and CRT libraries, see the MSDN topic "Visual C++ Libraries as Shared Side-by-Side Assemblies" for details
			// But, this manifest is unnecessary for statically linked programs
			if(!useDLL)
			{
				LinkTool.GenerateManifest = false;
				
				var ManifestTool = config.Tools('VCManifestTool');
				ManifestTool.EmbedManifest = false;			
			}
			
			// Resource settings
			var RCTool = config.Tools("VCResourceCompilerTool");
			RCTool.Culture = rcEnglishUS;
			RCTool.AdditionalIncludeDirectories = "$(IntDir); $(WXWIN)/include";
			if(bDebug)
				RCTool.PreprocessorDefinitions = "_DEBUG";
			else
				RCTool.PreprocessorDefinitions = "NDEBUG";
			
			// 添加预编译事件
			if(!bDebug)
			{
				//var PreBuildTool = config.Tools("VCPreBuildEventTool");
				//PreBuildTool.Description = "增加编译版本号 . . .";
				//if ( wizard.FindSymbol('WX_USE_VERSION_RC'))
				//{
				//	var name = wizard.FindSymbol('PROJECT_NAME');
				//	PreBuildTool.CommandLine = "AutoBuildNumber.exe \"$(ProjectDir)/" + name + ".rc\""
				//}
				//else
				//{
				//	PreBuildTool.CommandLine = "ChangeRev.exe /s\"$(ProjectDir).svn\\entries\" /f\"$(ProjectDir)version.cpp\""
				//}
			}
		}
	}
	catch(e)
	{
		throw e;
	}
}

function DelFile(fso, strWizTempFile)
{
	try
	{
		if (fso.FileExists(strWizTempFile))
		{
			var tmpFile = fso.GetFile(strWizTempFile);
			tmpFile.Delete();
		}
	}
	catch(e)
	{
		throw e;
	}
}

function CreateCustomInfFile()
{
	try
	{
		var fso, TemplatesFolder, TemplateFiles, strTemplate;
		fso = new ActiveXObject('Scripting.FileSystemObject');

		var TemporaryFolder = 2;
		var tfolder = fso.GetSpecialFolder(TemporaryFolder);
		var strTempFolder = tfolder.Drive + '\\' + tfolder.Name;

		var strWizTempFile = strTempFolder + "\\" + fso.GetTempName();

		var strTemplatePath = wizard.FindSymbol('TEMPLATES_PATH');
		var strInfFile = strTemplatePath + '\\Templates.inf';
		wizard.RenderTemplate(strInfFile, strWizTempFile);

		var WizTempFile = fso.GetFile(strWizTempFile);
		return WizTempFile;
	}
	catch(e)
	{
		throw e;
	}
}

function GetTargetName(strName, strProjectName)
{
	try
	{
		var strTarget = strName;
		var strResPath = "res\\";
		
		if(strName.substr(0, 4) == "root")
		{
			var nNameLen = strName.length;
			if(strName == "root.ico" || strName == "root.exe.Manifest")
			{
				strTarget = strResPath + strProjectName + strName.substr(4, nNameLen - 4);
			}
			else
			{
				strTarget = strProjectName + strName.substr(4, nNameLen - 4);
			}
		}
		else if(strName.substr(0, 4) == "safe")
		{
			var nNameLen = strName.length;
			var strSafeProjectName = wizard.FindSymbol('SAFE_PROJECT_NAME');
			strTarget = strSafeProjectName + strName.substr(4, nNameLen - 4);
		}
		else if(strName.substr(0, 7) == "yuxpcom" )
		{
			var nNameLen = strName.length;
			var strSafeProjectName = wizard.FindSymbol('SAFE_PROJECT_NAME');
			strTarget = strSafeProjectName + strName.substr(7, nNameLen - 7);
		}

		return strTarget; 
	}
	catch(e)
	{
		throw e;
	}
}

function AddFilesToCustomProj(proj, strProjectName, strProjectPath, InfFile)
{
	try
	{	
		// add Interface Filter
		var grsIFilter;
		//if(wizard.FindSymbol('GRS_USE_INTERFACE'))
		{
			strSrcFilter = wizard.FindSymbol('INTERFACE_FILTER');
			grsIFilter = proj.Object.AddFilter('Interface Files');
			grsIFilter.Filter = strSrcFilter;
		}
		
		var projItems = proj.ProjectItems

		var strTemplatePath = wizard.FindSymbol('TEMPLATES_PATH');
		var strSafeProjectName = wizard.FindSymbol('SAFE_PROJECT_NAME');

		var strTpl = '';
		var strName = '';
		
		var strTextStream = InfFile.OpenAsTextStream(1, -2);
		while (!strTextStream.AtEndOfStream)
		{
			strTpl = strTextStream.ReadLine();
			if (strTpl != '')
			{
				strName = strTpl;
				var strTarget = GetTargetName(strName, strProjectName);
				var strTemplate = strTemplatePath + '\\' + strTpl;
				var strFile = strProjectPath + '\\' + strTarget;

				var bCopyOnly = false;  //"true" will only copy the file from strTemplate to strTarget without rendering/adding to the project
				var strExt = strName.substr(strName.lastIndexOf("."));
				if(strExt==".bmp" || strExt==".ico" || strExt==".gif" || strExt==".rtf" || strExt==".css" || strExt== ".exe")
					bCopyOnly = true;
				wizard.RenderTemplate(strTemplate, strFile, bCopyOnly);
				if ( bCopyOnly )
					continue;
				
				if(strTarget == strSafeProjectName + "_I.h")
				{
					//if(wizard.FindSymbol('GRS_USE_INTERFACE'))
					{
						// Add Files to GRS Interface Filter
						grsIFilter.AddFile(strFile);
					}						
				}
				else
				{
					// Add Files to Project
					proj.Object.AddFile(strFile);
				}
			}
		}
		strTextStream.Close();
	}
	catch(e)
	{
		throw e;
	}
}

function AddGUID()
{
	
	wizard.AddSymbol( "GRS_GUID_PLUGIN", CreateGUID()[0] );
	
	if(wizard.FindSymbol('YUXPCOM_USE_INTERFACE'))
	{	
		wizard.AddSymbol( "YU_GUID_INTERFACE", CreateGUID()[1] );	
	}
	
	if(wizard.FindSymbol('GRS_USE_TOOLBAR'))
	{
		wizard.AddSymbol( "GRS_GUID_TOOLBAR", CreateGUID() );
	}
	
	if(wizard.FindSymbol('GRS_USE_MENU'))
	{
		wizard.AddSymbol( "GRS_GUID_MENU", CreateGUID() );
	}
	
	if(wizard.FindSymbol('GRS_USE_SET'))
	{
		wizard.AddSymbol( "GRS_GUID_SET", CreateGUID() );
	}
	
	if(wizard.FindSymbol('GRS_USE_PANEL'))
	{
		wizard.AddSymbol( "GRS_GUID_PANEL", CreateGUID() );
	}
	
	if(wizard.FindSymbol('GRS_USE_EDITOR'))
	{
		wizard.AddSymbol( "GRS_GUID_EDITOR", CreateGUID() );
	}	
	
	////
	var date1;
  var dateString;
  date1 = new Date();
  dateString = date1.getFullYear().toString();
  var month = date1.getMonth() + 1;
  if( month < 10 )
  	dateString += "0";
  dateString += month;
  
  var day = date1.getDate();
  if( day < 10 )
  	dateString += "0";  	
  dateString += day;
 
  wizard.AddSymbol( "YU_CREATE_DATE", dateString );
}


function CreateGUID()
{
	var guid = wizard.CreateGuid();	
	var arr = guid.split('-');
	
	var a0 = arr[0];
	var a1 = arr[1];	
	var a2 = arr[2];
	var a3 = arr[3];
	var a4 = arr[4];
	
	a0 = a0.replace("{","{ 0x");
	a0 += ", "
	
	a1 = "0x" + a1 + ", ";
	a2 = "0x" + a2 + ", ";	
	
	var b3 = "{ 0x";
	b3 += a3.substring(0,2);
	b3 += ", 0x";
	b3 += a3.substring(2,4);
	
	var b4 = ", 0x";
	b4 += a4.substring(0,2);
	b4 += ", 0x";
	b4 += a4.substring(2,4);
	b4 += ", 0x";
	b4 += a4.substring(4,6);
	b4 += ", 0x";
	b4 += a4.substring(6,8);
	b4 += ", 0x";
	b4 += a4.substring(8,10);
	b4 += ", 0x";
	b4 += a4.substring(10,12);
	b4 += " } }";
	
	var guidA = guid; 
	guid = (a0 + a1 + a2 + b3 + b4);
	return [guid,guidA];
}
