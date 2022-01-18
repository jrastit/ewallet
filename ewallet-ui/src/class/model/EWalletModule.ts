class EWalletModule {
  getModuleName(): string {
    return ''
  }
  getModuleVersion(): string {
    return ''
  }
  getModuleContract(): string {
    return ''
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
