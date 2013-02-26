#include "stdafx.h"
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


NS_IMPL_ISUPPORTS2( [!output YU_COMP_NAME]Component, [!output YU_INTERFACE_NAME], nsIObserver)

[!output YU_COMP_NAME]Component::[!output YU_COMP_NAME]Component()
{


}

[!output YU_COMP_NAME]Component::~[!output YU_COMP_NAME]Component()
{

}

NS_IMETHODIMP [!output YU_COMP_NAME]Component::HandleEvent(nsIDOMEvent *aEvent)
{
	nsAString &type = EmptyString();
	if (!aEvent) 
		return NS_ERROR_INVALID_ARG;

	bool targetMatched = true;

	nsCOMPtr<nsIDOMEvent> event(aEvent);
	event->GetType( type );
	const nsAString::char_type *cType = type.BeginReading( );

	nsCOMPtr<nsIDOMEventTarget> target;
	event->GetCurrentTarget( getter_AddRefs(target) );

	if( target ) {
		nsCOMPtr<nsIXMLHttpRequest> pRequest = do_QueryInterface( target );
		nsAString &respTxt = EmptyString();
		pRequest->GetResponseText(respTxt);
		const nsAString::char_type *beg = respTxt.BeginReading( );

		nsAString &respHed = EmptyString();
		nsAString &respVal = EmptyString();

		pRequest->GetAllResponseHeaders( respHed );
		const nsAString::char_type *begH = respHed.BeginReading( );
		pRequest->GetStatusText( respVal );
		const nsAString::char_type *begVal = respVal.BeginReading( );

		popMessage( beg );
	}

	return NS_OK;
}

NS_IMETHODIMP [!output YU_COMP_NAME]Component::Sum(PRInt32 aFirst, PRInt32 aSecond, PRInt32 *_retval )
{
	*_retval = aFirst + aSecond;
	//////
	nsCOMPtr<nsIXMLHttpRequest> pXMLHttpRequest;
	nsresult rv;
	const nsAString& empty = EmptyString();
	pXMLHttpRequest = do_CreateInstance(NS_XMLHTTPREQUEST_CONTRACTID, &rv );
	if (!NS_FAILED(rv))
	{
		int i;
		nsAString &sUser = EmptyString();
		nsAString &sPwd = EmptyString();

		rv = pXMLHttpRequest->Open(NS_LITERAL_CSTRING("GET"),
			NS_LITERAL_CSTRING("https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference_group"),			
			true, sUser, sPwd
			);

		nsCOMPtr<nsIDOMEventTarget> target(do_QueryInterface(pXMLHttpRequest));
		
		target->AddEventListener(NS_LITERAL_STRING("load"), this,
			                           PR_FALSE);
		target->AddEventListener(NS_LITERAL_STRING("error"), this,
			PR_FALSE);

		pXMLHttpRequest->Send(NULL);
		if(NS_FAILED(rv))
		{
			i=1;
		}else{
			i=0;
		}
	}

	return NS_OK;
}

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
	rv = branch->SetCharPref("ssl", "proxy.huawei.com" );
	if( NS_FAILED( rv ))
		return -1;

	rv = branch->SetIntPref("ssl_port", 8080);
	if( NS_FAILED( rv ))
		return -1;

	// set http proxy
	branch->SetCharPref("http", "proxy.huawei.com" );
	if( NS_FAILED( rv ))
		return -1;

	rv = branch->SetIntPref("http_port", 8080);
	if( NS_FAILED( rv ))
		return -1;

	return NS_OK;
}