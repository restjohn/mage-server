class AboutController {
  constructor(Api) {
    this.Api = Api;
  }

  $onInit() {
    this.Api.get(api => {
      this.name = api.name;
      this.serverVersion = api.version;
      this.apk = api.apk;
      this.nodeVersion = api.environment.nodeVersion;
      this.mongodbVersion = api.environment.mongodbVersion;
    });
  }
}

AboutController.$inject = ['Api'];

export default {
  template: require('./about.html'),
  controller: AboutController
};