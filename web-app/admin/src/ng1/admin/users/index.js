import angular from 'angular';
import adminUserEdit from './user.edit.component';
import adminUserDelete from './user.delete.component';

angular.module('mage')
  .component('adminUserEdit', adminUserEdit)
  .component('adminUserDelete', adminUserDelete)
