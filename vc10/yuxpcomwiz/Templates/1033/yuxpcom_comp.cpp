//#include "stdafx.h"
#include <iostream>
using namespace std;


/* yuaccess.cpp*/
#include "[!output YU_COMP_NAME]_comp.h"

#define MOZILLA_STRICT_API

#include "mozilla/ModuleUtils.h"
#include "nsComponentManagerUtils.h"
#include "nsServiceManagerUtils.h"

#include "nsCOMPtr.h"
#include "nsXPCOM.h"
#include "nsIServiceManager.h"
#include "nsICategoryManager.h"

#include "nsMemory.h"
#include "nsIObserver.h"

#include "nsEmbedString.h"

#include "nsIDOMEvent.h"
#include "nsIXMLHttpRequest.h"
#include "nsIProtocolProxyService.h"
#include "nsNetCID.h"
#include "nsIPrefService.h"
#include "nsIPrefBranch.h"
#include "nsIConsoleService.h"
//////////////////////////////////////////////////////////////////////////

void popMessage( const nsAString::char_type *msg)
{
	nsresult rv = NS_OK;
	nsCOMPtr<nsIConsoleService> msgSer = do_GetService( NS_CONSOLESERVICE_CONTRACTID, &rv );
	if( NS_FAILED( rv ) )
		return;

	nsAString &str = EmptyString();
	str.Append( msg );
	msgSer->LogStringMessage( str.BeginReading() );

}

[!if YU_INTERFACE_INHERI_NSIOBSERVER]
NS_IMPL_ISUPPORTS2( [!output YU_COMP_NAME]Component, [!output YU_INTERFACE_NAME], nsIObserver)
[!else]
NS_IMPL_ISUPPORTS1( [!output YU_COMP_NAME]Component, [!output YU_INTERFACE_NAME])
[!endif]

[!output YU_COMP_NAME]Component::[!output YU_COMP_NAME]Component()
{


}

[!output YU_COMP_NAME]Component::~[!output YU_COMP_NAME]Component()
{

}

NS_IMETHODIMP [!output YU_COMP_NAME]Component::Sum(PRInt32 aFirst, PRInt32 aSecond, PRInt32 *_retval )
{
	*_retval = aFirst + aSecond;
	//////
	return NS_OK;
}

[!if YU_INTERFACE_INHERI_NSIOBSERVER]
NS_IMETHODIMP [!output YU_COMP_NAME]Component::Observe(nsISupports *aSubject, const char * aTopic, const PRUnichar * aData)
{
	nsresult rv = NS_OK;

	///// now we can set the xpcom network proxy
	nsCOMPtr<nsIPrefService> prefs = do_GetService("@mozilla.org/preferences-service;1", &rv);
	if( NS_FAILED( rv ))
		return -1;

	nsCOMPtr< nsIPrefBranch > branch;
	prefs->GetBranch( "network.proxy.", getter_AddRefs( branch) );

	if( !branch )
		return -1;

	// set proxy type
	rv = branch->SetIntPref("type", 1);
	if( NS_FAILED( rv ))
		return -1;

	// set https proxy
	rv = branch->SetCharPref("ssl", "www.proxy.com" );
	if( NS_FAILED( rv ))
		return -1;

	rv = branch->SetIntPref("ssl_port", 8080);
	if( NS_FAILED( rv ))
		return -1;

	// set http proxy
	branch->SetCharPref("http", "www.proxy.com" );
	if( NS_FAILED( rv ))
		return -1;

	rv = branch->SetIntPref("http_port", 8080);
	if( NS_FAILED( rv ))
		return -1;

	return NS_OK;
}
[!endif]
