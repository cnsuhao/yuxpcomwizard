function OnFinish(selProj, selObj)
{
	try
	{
		var isSDKVar = wizard.FindSymbol('YU_XPCOM_SDK_IS_VIRIANT');
		if( isSDKVar ) {
			var valD = wizard.FindSymbol('YU_XPCOM_SDK_PATH_DEBUG');
			valD = "$(" + valD + ")";
			wizard.AddSymbol('YU_XPCOM_SDK_PATH_DEBUG',  valD );
			
			valD = wizard.FindSymbol('YU_XPCOM_SDK_PATH_RELEASE');
			valD = "$(" + valD + ")";
			wizard.AddSymbol('YU_XPCOM_SDK_PATH_RELEASE',  valD );
		}
		
	    /// 增加符号 
        //////////////////////////////////////////////////////////////////////////
		var strSolutionName = "";
		var strProjectPath = "";
		
		var strProjectName = wizard.FindSymbol('PROJECT_NAME');
		var strProjectPath = wizard.FindSymbol('PROJECT_PATH');
		var oldProjFolder = strProjectPath;		
		
		selProj = CreateCustomProject(strProjectName, strProjectPath);
		strProjectPath = wizard.FindSymbol('PROJECT_PATH');
		
/*
		var strSolutionPath = "";
		
		strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
		if (strSolutionName.length)
		{
			strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
			strProjectPath = strSolutionPath + "src\\" + strProjectName;
		}
		
		wizard.AddSymbol( "YU_DIR_BIN", strSolutionPath + "bin\\" );	
		wizard.AddSymbol( "YU_DIR_DOC", strSolutionPath + "doc\\" );
		wizard.AddSymbol( "YU_DIR_SRC_INC", strSolutionPath + "src\\include\\" );
		wizard.AddSymbol( "YU_DIR_SRC_INT", strSolutionPath + "src\\interface\\" );
		*/

		///////////////
		selProj.Object.Keyword = "xpcomWizProj";
		AddConfig(selProj, strProjectName);
		
		AddFilters(selProj);
		
		AddGUID();

		var InfFile = CreateCustomInfFile();
		AddFilesToCustomProj(selProj, strProjectName, strProjectPath, InfFile);
		InfFile.Delete();

		//fso = new ActiveXObject('Scripting.FileSystemObject');
		//wizard.YesNoAlert(oldProjFolder);
		//fso.DeleteFolder(oldProjFolder);

		//////////////////////
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
		strProjTemplate = strProjTemplatePath + '\\default.vcxproj';
		var strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
		strProjectPath = strSolutionPath + "src\\" + strProjectName;
		wizard.AddSymbol('PROJECT_PATH',  strProjectPath );

		var Solution = dte.Solution;
		var strSolutionName = "";
		if (wizard.FindSymbol("CLOSE_SOLUTION"))
		{
			Solution.Close();
			strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
			if (strSolutionName.length)
			{
				Solution.Create(strSolutionPath, strSolutionName);
				wizard.AddSymbol( "YU_FIRST_PROJECT", true );
			}
		}
		
		var strProjectNameWithExt = '';
		strProjectNameWithExt = strProjectName + '.vcxproj';

		var oTarget = wizard.FindSymbol("TARGET");
		var prj;
		if (wizard.FindSymbol("WIZARD_TYPE") == vsWizardAddSubProject)  // vsWizardAddSubProject
		{
			var prjItem = oTarget.AddFromTemplate(strProjTemplate, strProjectNameWithExt);
			prj = prjItem.SubProject;
		}
		else
		{
			prj = oTarget.AddFromTemplate(strProjTemplate, strProjectPath, strProjectNameWithExt);
		}
		
		var fxtarget = wizard.FindSymbol("TARGET_FRAMEWORK_VERSION");
		if (fxtarget != null && fxtarget != "")
		{
		    fxtarget = fxtarget.split('.', 2);
		    if (fxtarget.length == 2)
			prj.Object.TargetFrameworkVersion = parseInt(fxtarget[0]) * 0x10000 + parseInt(fxtarget[1])
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
		
		
		if( wizard.FindSymbol('YU_USE_INTERFACE') )
		{
			strSrcFilter = wizard.FindSymbol('INTERFACE_FILTER');
			group = proj.Object.AddFilter('Interface Files');
			group.Filter = strSrcFilter;
			
			strSrcFilter = wizard.FindSymbol('TOOLS_FILTER');
			group = proj.Object.AddFilter('Tools Files');
			group.Filter = strSrcFilter;			
		}
		
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
			
			config.IntermediateDirectory = "$(Configuration)\\";
			config.OutputDirectory = "../../bin/components/";
			config.CharacterSet = charSetUnicode;
			config.ConfigurationType  = typeDynamicLibrary;
			
			// Compiler settings
			var CLTool = config.Tools('VCCLCompilerTool');
			CLTool.RuntimeTypeInfo = true;
			//CLTool.TreatWChar_tAsBuiltInType = false;
			//CLTool.Detect64BitPortabilityProblems = true;
			CLTool.WarningLevel = warningLevel_3;
			
			if(bDebug)
			{ 
				var val = wizard.FindSymbol('YU_XPCOM_SDK_PATH_DEBUG');
				CLTool.AdditionalIncludeDirectories = "..\\include;..\\interface;" + val + "\\include;" + val + "\\include\\nspr";
			}else{
				var val = wizard.FindSymbol('YU_XPCOM_SDK_PATH_RELEASE');
				CLTool.AdditionalIncludeDirectories = "..\\include;..\\interface;" + val + "\\include;" + val + "\\include\\nspr";
			}
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
			
			LinkTool.GenerateManifest = false;
			additionalDepends += "nspr4.lib xpcom.lib xpcomglue_s_nomozalloc.lib";
			
			LinkTool.AdditionalDependencies = additionalDepends;
			//LinkTool.AdditionalLibraryDirectories = "$(XPCOM_SDK)\\lib";
			if(bDebug)
			{ 
				var val = wizard.FindSymbol('YU_XPCOM_SDK_PATH_DEBUG');
				LinkTool.AdditionalLibraryDirectories = val + "\\lib";
			}else{
				var val = wizard.FindSymbol('YU_XPCOM_SDK_PATH_RELEASE');
				LinkTool.AdditionalLibraryDirectories = val + "\\lib";
			}
			
			
			var strCompName = wizard.FindSymbol('YU_COMP_NAME');
			LinkTool.OutputFile = "$(OutDir)" + strCompName + "$(TargetExt)";
		
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
			RCTool.AdditionalIncludeDirectories = "$(IntDir)";
			if(bDebug)
				RCTool.PreprocessorDefinitions = "_DEBUG";
			else
				RCTool.PreprocessorDefinitions = "NDEBUG";
			
			// 添加预编译事件
			/*
			var PreBuildTool = config.Tools("VCPreBuildEventTool");
			PreBuildTool.Description = "Buils idl file . . .";
			PreBuildTool.CommandLine = "$(SolutionDir)\\src\\interface\\gentypedef.bat";
			*/	

			// Add Debug Setting
			var debugSet = config.DebugSettings;
			if( debugSet ) {
				if(bDebug)
				{ 
					var val = wizard.FindSymbol('YU_XPCOM_SDK_PATH_DEBUG');
					debugSet.Command = val + "\\bin\\xulrunner.exe";
				}else{
					var val = wizard.FindSymbol('YU_XPCOM_SDK_PATH_RELEASE');
					debugSet.Command = val + "\\bin\\xulrunner.exe";
				}
				
				
				debugSet.CommandArguments = "application.ini";
				debugSet.WorkingDirectory = "..\\..\\bin\\";
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
		var nNameLen = strName.length;
		if( strName == "yuxpcom_I.xpidl" ) {
			var strInterfaceName = wizard.FindSymbol('YU_INTERFACE_NAME');
			strTarget = "..\\interface\\" + strInterfaceName + ".xpidl";
		}
		//else if( strName == "gentypedef.bat" ) {
		//	strTarget = "..\\interface\\" + strName;
		//}
		else if( strName == "buildxpidl.bat" ) {
			strTarget = "..\\interface\\" + strName;
		}		
		else if( strName == "bin_comp_yuaccess.manifest" ) {
			var strCompName = wizard.FindSymbol('YU_COMP_NAME');
			strTarget = "..\\..\\bin\\components\\" + strCompName + ".manifest";
		}
		else if(strName == "bin_application.ini") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName == "bin_chrome.manifest") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName == "bin_build.xml") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}		
		else if(strName == "bin_install.rdf") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}		
		else if(strName == "bin_run.bat") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName == "bin_def_pre_prefs.js") {
			strTarget = "..\\..\\bin\\defaults\\preferences\\" + strName.substr(12, nNameLen-12);
		}
		else if(strName == "chr_con_about.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_about.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_controller.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_head.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_options.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_opt_network.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_test.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_test.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_loc_en_about.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_loc_en_options.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_loc_en_opt_network.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_loc_en_test.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_skin_about.css") {
			strTarget = "..\\..\\bin\\chrome\\skin\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_options.css") {
			strTarget = "..\\..\\bin\\chrome\\skin\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_test.css") {
			strTarget = "..\\..\\bin\\chrome\\skin\\" + strName.substr(9, nNameLen-9);
		}			
		else if(strName == "chr_skin_close.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_copy.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}		
		else if(strName == "chr_skin_options-big.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_options-network.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}
		else if( strName == "inc_doc.txt" )
		{
			strTarget = "..\\include\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName.substr(0, 7) == "yuxpcom" )
		{
			var nNameLen = strName.length;
			var strSafeProjectName = wizard.FindSymbol('YU_COMP_NAME');
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
		var projItems = proj.ProjectItems

		var strTemplatePath = wizard.FindSymbol('TEMPLATES_PATH');
		var strSafeProjectName = wizard.FindSymbol('SAFE_PROJECT_NAME');

		var strTpl = '';
		var strName = '';
		
		// add new filter
		var binFilter = proj.Object.AddFilter('bin');
		var chrFilter = binFilter.AddFilter('chrome');
		var compFilter = binFilter.AddFilter('components');
			compFilter.Filter = "xpt";
		var defFilter = binFilter.AddFilter('defaults');
		
		var contentFilter = chrFilter.AddFilter('content');
		var localeFilter = chrFilter.AddFilter('locale');
			var enFilter = localeFilter.AddFilter('en-US');
		var skinFilter = chrFilter.AddFilter('skin');
			var imgsFilter = skinFilter.AddFilter('images');
			
		var prefFilter = defFilter.AddFilter('preferences');
		
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
				if(strExt==".bmp" || strExt==".ico" || strExt==".gif" || strExt==".rtf" || strExt==".css" || strExt== ".exe"
					|| strExt== ".png")
					bCopyOnly = true;
					
				wizard.RenderTemplate(strTemplate, strFile, bCopyOnly);
				if ( bCopyOnly )
					continue;
				
				//wizard.YesNoAlert(strTarget);
				// Add Files to Project
				if( strName == "bin_comp_yuaccess.manifest" ) {
					compFilter.AddFile(strFile);
				}
				else if(strName == "bin_application.ini") {
					binFilter.AddFile(strFile);
				}
				else if(strName == "bin_chrome.manifest") {
					binFilter.AddFile(strFile);
				}
				else if(strName == "bin_build.xml") {
					binFilter.AddFile(strFile);
				}		
				else if(strName == "bin_install.rdf") {
					binFilter.AddFile(strFile);
				}		
				else if(strName == "bin_run.bat") {
					binFilter.AddFile(strFile);
				}
				else if(strName == "bin_def_pre_prefs.js") {
					prefFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_about.js") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_about.xul") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_controller.js") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_head.js") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_options.xul") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_opt_network.xul") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_test.js") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_con_test.xul") {
					contentFilter.AddFile(strFile);
				}
				else if(strName == "chr_loc_en_about.dtd") {
					enFilter.AddFile(strFile);
				}
				else if(strName == "chr_loc_en_options.dtd") {
					enFilter.AddFile(strFile);
				}
				else if(strName == "chr_loc_en_opt_network.dtd") {
					enFilter.AddFile(strFile);
				}
				else if(strName == "chr_loc_en_test.dtd") {
					enFilter.AddFile(strFile);
				}
				else if(strName == "chr_skin_about.css") {
					skinFilter.AddFile(strFile);
				}
				else if(strName == "chr_skin_options.css") {
					skinFilter.AddFile(strFile);
				}
				else if(strName == "chr_skin_test.css") {
					skinFilter.AddFile(strFile);
				}			
				else if(strName == "chr_skin_close.png") {
					imgsFilter.AddFile(strFile);
				}
				else if(strName == "chr_skin_copy.png") {
					imgsFilter.AddFile(strFile);
				}		
				else if(strName == "chr_skin_options-big.png") {
					imgsFilter.AddFile(strFile);
				}
				else if(strName == "chr_skin_options-network.png") {
					imgsFilter.AddFile(strFile);
				}
				else{
					proj.Object.AddFile(strFile);				
				}

				// Add xpidl's custom build prop
				if( strExt == ".xpidl" ) {
					var stridlName = strTarget.substr(strTarget.lastIndexOf("\\")+1);
					var oIdlFile = proj.Object.Files( stridlName );
					if( oIdlFile ) {
						var cntConf = oIdlFile.FileConfigurations.Count;
						var nCntConf;
						for(nCntConf = 1; nCntConf <= cntConf; nCntConf++)
						{
							var CBTool =  oIdlFile.FileConfigurations.Item(nCntConf).Tool;
							if( CBTool ) {
								var interName = wizard.FindSymbol('YU_INTERFACE_NAME');
								CBTool.CommandLine = "..\\interface\\buildxpidl.bat " + interName +".xpidl " + 
										"../../bin/components/"+ interName + ".xpt " +
										"../include/" + interName + ".h";
								
								CBTool.Description = "Create header File and xpt File...";
								CBTool.Outputs = "../include/" + interName + ".h";						
							}						
						}					
					}
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
	if(wizard.FindSymbol('YU_USE_INTERFACE'))
	{	
		var interID = wizard.CreateGuid();
		strVal = wizard.FormatGuid(interID, 0);
		wizard.AddSymbol( "YU_INTERFACE_ID_IDL", strVal );	
		strVal = wizard.FormatGuid(interID, 2);		
		wizard.AddSymbol( "YU_INTERFACE_ID_CLASS", strVal );	
	}
	
	var compName = wizard.FindSymbol('YU_COMP_NAME');
	if( compName ) {
		wizard.AddSymbol( "YU_COMP_NAME_UPCASE", compName.toUpperCase() );	
	}
	
	var interName = wizard.FindSymbol('YU_INTERFACE_NAME');
	if( interName ) {
		wizard.AddSymbol( "YU_INTERFACE_NAME_UPCASE", interName.toUpperCase() );
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

