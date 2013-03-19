function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "XPCOM Interface Wizard";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function OnFinish(selProj, selObj)
{   
	var oCM;
	try
	{
		oCM	= selProj.CodeModel;

		var strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
		var strDefFileName = wizard.FindSymbol("ITEM_NAME");
		wizard.AddSymbol( "YU_INTERFACE_NAME", strDefFileName );	
		
		var L_addFile_Text = "Add file ";
		oCM.StartTransaction( L_addFile_Text + strDefFileName);
	
		// check whether there is already a .def file in the project
		var nPI, strPIName;
		var oFiles = selProj.Object.Files;
		var cFiles = oFiles.Count;
		
		// use the filesystem object to check for file existance
		var oFSO = new ActiveXObject("Scripting.FileSystemObject");
		if (oFSO.FileExists(strDefFileName))
		{
			L_thisFileExists_Text = " already exists. Please choose a different file name.";
			wizard.ReportError(strDefFileName + L_thisFileExists_Text);
			return VS_E_WIZCANCEL;
		}
		
		// render the def file 
		var strProjectPath = wizard.FindSymbol('PROJECT_PATH');
		
		AddGUID();
		var InfFile = CreateCustomInfFile();
		AddFilesToCustomProj(selProj, strProjectPath, InfFile);
		InfFile.Delete();
		
		// change the component.manifest
		//// open interface file
       var deffile = selProj.Object.Files( strDefFileName + ".xpidl" );
       if( deffile )
       {
           var window = deffile.Object.Open(vsViewKindPrimary);
           if(window)
               window.visible = true;
       }

		oCM.CommitTransaction();
	}
	catch(e)
	{
		if (oCM)
			oCM.AbortTransaction();

		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function StripPath(strFullPath)
{
	try
	{
		var nIndex = strFullPath.lastIndexOf("\\", strFullPath.length);
		if (nIndex != -1)
		{
			return strFullPath.substring(nIndex+1, strFullPath.length);
		}
		
		return strFullPath;
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

function GetTargetName(strName)
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

function AddFilesToCustomProj(proj, strProjectPath, InfFile)
{
	try
	{	
		var projItems = proj.ProjectItems

		var strTemplatePath = wizard.FindSymbol('TEMPLATES_PATH');

		var strTpl = '';
		var strName = '';
		
		var strTextStream = InfFile.OpenAsTextStream(1, -2);
		while (!strTextStream.AtEndOfStream)
		{
			strTpl = strTextStream.ReadLine();
			if (strTpl != '')
			{
				strName = strTpl;
				var strTarget = GetTargetName(strName);
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
				
				// Add Files to Project
				if( strName == "bin_comp_yuaccess.manifest" ) {
					compFilter.AddFile(strFile);
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

						var fiInter = proj.Object.Filters.Item('Interface Files');
						var fileH = "../include/" + interName + ".h";
						fiInter.AddFile(fileH);
						
						var fiXPT = proj.Object.Filters.Item('components');
						fileH = "../../bin/components/"+ interName + ".xpt";
						fiXPT.AddFile(fileH);
						
						/// change component's manifest file
						var nPI, strPIName;
						var oFiles = proj.Object.Files;
						var cFiles = oFiles.Count;
						for (nPI=1; nPI<=cFiles; nPI++)
						{
							strPIName = oFiles(nPI).Name;
							if (strPIName.substr(strPIName.length-9)==".manifest" &&
							    strPIName != "chrome.manifest" )
							{	
								var oFSO = new ActiveXObject("Scripting.FileSystemObject");
                                wizard.YesNoAlert( "../../bin/components/" + strPIName );
								wizard.YesNoAlert( strProjectPath);
								var maniF = oFSO.GetFile( strProjectPath + "../../bin/components/" + strPIName );
								if( maniF ) {
									var strMani = maniF.OpenAsTextStream(8, -2);
									if( strMani ) {
										var appTxt = "interface " + interName + ".xpt";
										strMani.WriteLine(appTxt);
										strMani.Close();
									}
								
								}
								
								break;
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
	var interID = wizard.CreateGuid();
	strVal = wizard.FormatGuid(interID, 0);
	wizard.AddSymbol( "YU_INTERFACE_ID_IDL", strVal );	
	strVal = wizard.FormatGuid(interID, 2);		
	wizard.AddSymbol( "YU_INTERFACE_ID_CLASS", strVal );	
	
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

