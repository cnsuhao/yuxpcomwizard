
#include "mozilla/ModuleUtils.h"
#include "nsIClassInfoImpl.h"
#include "yuaccess.h"


nsresult [!output SAFE_PROJECT_NAME]LoadFuncPtr()
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

void [!output SAFE_PROJECT_NAME]UnloadFuncPtr()
{

}


//////////////////////////////////////////////////////////////////////////
NS_GENERIC_FACTORY_CONSTRUCTOR( [!output SAFE_PROJECT_NAME]Component )

NS_DEFINE_NAMED_CID(YUACCESS_COMPONENTS_CID);

static const mozilla::Module::CIDEntry kYuAccessComCIDs[] = {
	{ &kYUACCESS_COMPONENTS_CID, false, NULL, [!output SAFE_PROJECT_NAME]Constructor },
	{ NULL }
};

static const mozilla::Module::ContractIDEntry kYuAccessContracts[] = {
	{ YUACCESS_COMPONENTS_CONTRACTID, &kYUACCESS_COMPONENTS_CID },
	{ NULL }
};

static const mozilla::Module::CategoryEntry kYuAccessCategories[] = {
	{"yuaccess-category", "yuaccess-key", YUACCESS_COMPONENTS_CONTRACTID },
	{ NULL }
};

static const mozilla::Module kYuAccessModule = {
	mozilla::Module::kVersion,
	kYuAccessComCIDs,
	kYuAccessContracts,
	kYuAccessCategories,
	NULL,
	yuAccessLoadFuncPtr,
	yuAccessUnloadFuncPtr
};

NSMODULE_DEFN( nsYuAccessModule ) = &kYuAccessModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kYuAccessModule)