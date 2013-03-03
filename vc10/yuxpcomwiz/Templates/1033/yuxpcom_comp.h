
/*yuaccess.h*/
#pragma once
#ifndef _[!output YU_COMP_NAME_UPCASE]_COMPONENTS_H_
#define _[!output YU_COMP_NAME_UPCASE]_COMPONENTS_H_

#include "[!output YU_INTERFACE_NAME].h"
#include "nsIServiceManager.h"
#include "nsICategoryManager.h"
#include "nsIObserver.h"
#include "nsMemory.h"

#include "nsIDOMEventListener.h"
#include "nsIDOMEventTarget.h"

#define [!output YU_COMP_NAME_UPCASE]_COMPONENTS_CONTRACTID "[!output YU_COMP_CONTRACTID]"
#define [!output YU_COMP_NAME_UPCASE]_COMPONENTS_CID  [!output YU_INTERFACE_ID_CLASS];



class [!output YU_COMP_NAME]Component : 
	public [!output YU_INTERFACE_NAME],
	public nsIObserver,
	public nsIDOMEventListener
{
public:
	NS_DECL_ISUPPORTS
	NS_DECL_[!output YU_INTERFACE_NAME_UPCASE]
	NS_DECL_NSIOBSERVER
	NS_DECL_NSIDOMEVENTLISTENER

	[!output YU_COMP_NAME]Component();

private:
	~[!output YU_COMP_NAME]Component();
};

//////
#endif //end _[!output YU_COMP_NAME_UPCASE]_COMPONENTS_H_