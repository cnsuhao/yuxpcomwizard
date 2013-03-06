
/*yuaccess.h*/
#pragma once
#ifndef _[!output YU_COMP_NAME_UPCASE]_COMPONENTS_H_
#define _[!output YU_COMP_NAME_UPCASE]_COMPONENTS_H_

#include "[!output YU_INTERFACE_NAME].h"
#include "nsIServiceManager.h"
#include "nsICategoryManager.h"
[!if YU_INTERFACE_INHERI_NSIOBSERVER]
#include "nsIObserver.h"
[!endif]
#include "nsMemory.h"


class [!output YU_COMP_NAME]Component : 
	public [!output YU_INTERFACE_NAME]
[!if YU_INTERFACE_INHERI_NSIOBSERVER]
	,public nsIObserver
[!endif]
{
public:
	NS_DECL_ISUPPORTS
	NS_DECL_[!output YU_INTERFACE_NAME_UPCASE]
[!if YU_INTERFACE_INHERI_NSIOBSERVER]
	NS_DECL_NSIOBSERVER
[!endif]

	[!output YU_COMP_NAME]Component();

private:
	~[!output YU_COMP_NAME]Component();
};

//////
#endif //end _[!output YU_COMP_NAME_UPCASE]_COMPONENTS_H_