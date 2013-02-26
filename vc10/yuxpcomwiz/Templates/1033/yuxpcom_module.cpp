
#include "mozilla/ModuleUtils.h"
#include "nsIClassInfoImpl.h"
#include "[!output YU_COMP_NAME]_comp.h"


nsresult [!output YU_COMP_NAME]LoadFuncPtr()
{
	nsCOMPtr<nsIServiceManager> servMan;

	nsresult rv = NS_GetServiceManager(getter_AddRefs(servMan));

	if (NS_FAILED(rv))
		return -1;

	nsCOMPtr< nsICategoryManager > catman;

	rv = servMan->GetServiceByContractID( NS_CATEGORYMANAGER_CONTRACTID,
		NS_GET_IID(nsICategoryManager),
		getter_AddRefs( catman ));

	if (NS_FAILED(rv))
		return -1;


	return NS_OK;
}

void [!output YU_COMP_NAME]UnloadFuncPtr()
{

}

//////////////////////////////////////////////////////////////////////////
NS_GENERIC_FACTORY_CONSTRUCTOR( [!output YU_COMP_NAME]Component )

NS_DEFINE_NAMED_CID([!output YU_COMP_NAME_UPCASE]_COMPONENTS_CID);

static const mozilla::Module::CIDEntry k[!output YU_COMP_NAME]ComCIDs[] = {
	{ &k[!output YU_COMP_NAME_UPCASE]_COMPONENTS_CID, false, NULL, [!output YU_COMP_NAME]Constructor },
	{ NULL }
};

static const mozilla::Module::ContractIDEntry k[!output YU_COMP_NAME]Contracts[] = {
	{ [!output YU_COMP_NAME_UPCASE]_COMPONENTS_CONTRACTID, &k[!output YU_COMP_NAME_UPCASE]_COMPONENTS_CID },
	{ NULL }
};

static const mozilla::Module::CategoryEntry k[!output YU_COMP_NAME]Categories[] = {
	{"yuaccess-category", "yuaccess-key", [!output YU_COMP_NAME_UPCASE]_COMPONENTS_CONTRACTID },
	{ NULL }
};

static const mozilla::Module k[!output YU_COMP_NAME]Module = {
	mozilla::Module::kVersion,
	k[!output YU_COMP_NAME]ComCIDs,
	k[!output YU_COMP_NAME]Contracts,
	k[!output YU_COMP_NAME]Categories,
	NULL,
	[!output YU_COMP_NAME]LoadFuncPtr,
	[!output YU_COMP_NAME]UnloadFuncPtr
};

NSMODULE_DEFN( ns[!output YU_COMP_NAME]Module ) = &k[!output YU_COMP_NAME]Module;
NS_IMPL_MOZILLA192_NSGETMODULE(&k[!output YU_COMP_NAME]Module)