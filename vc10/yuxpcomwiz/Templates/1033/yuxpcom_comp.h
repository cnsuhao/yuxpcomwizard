
/*yuaccess.h*/
#pragma once
#ifndef _[!output SAFE_PROJECT_NAME]_COMPONENTS_H_
#define _[!output SAFE_PROJECT_NAME]_COMPONENTS_H_

#include "yuaccess_i.h"
#include "nsIServiceManager.h"
#include "nsICategoryManager.h"
#include "nsIObserver.h"
#include "nsMemory.h"

#include "nsIDOMEventListener.h"
#include "nsIDOMEventTarget.h"

#define YUACCESS_COMPONENTS_CONTRACTID "@yudisk.org/IYuAccess;1"
#define YUACCESS_COMPONENTS_CID  { 0x4d016cbe, 0x5b17, 0x4d4e, { 0xae, 0x18, 0xf2, 0xe3, 0x85, 0xe5, 0x0, 0xb5 } };



class [!output SAFE_PROJECT_NAME]Component : 
	public IYuAccess,
	public nsIObserver,
	public nsIDOMEventListener
{
public:
	NS_DECL_ISUPPORTS
	NS_DECL_IYUACCESS
	NS_DECL_NSIOBSERVER
	NS_DECL_NSIDOMEVENTLISTENER

	[!output SAFE_PROJECT_NAME]Component();

private:
	~[!output SAFE_PROJECT_NAME]Component();
};

//////
#endif //end _[!output SAFE_PROJECT_NAME]_COMPONENTS_H_