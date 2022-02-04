class EWalletModule {

  version: number = 0
  setVersion?: (version: number) => void

  getModuleName(): string {
    return ''
  }
  getModuleVersion(): string {
    return ''
  }
  getModuleContract(): string {
    return ''
  }

  incVersion() {
    this.version += 1
    if (this.setVersion) {
      this.setVersion(this.version)
    }
  }

  toStringObj() {
    return ({
      moduleName: this.getModuleName && this.getModuleName(),
      moduleVersion: this.getModuleVersion && this.getModuleVersion(),
      moduleContract: this.getModuleContract && this.getModuleContract(),
    })
  }

  update?(): Promise<void>
}

export { EWalletModule }
