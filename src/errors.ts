export let errors = {
    notPhysicalPath(virtualPath: string, physicalPath: string) {
        let msg = `The physical path '${physicalPath}' of virtual path '${virtualPath}' is not a physical path.`
        let error = new Error()
    }
}