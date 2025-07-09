import { Injectable } from "@angular/core";
import { UserService } from "../user/user.service";
import { LocalStorageService } from "../http/local-storage.service";
import * as moment from "moment";
import * as _ from "lodash";
import { User } from "@ngageoint/mage.web-core-lib/user";
import {
  Event,
  Interval,
  FilterChoice,
  Team,
  TeamById,
  Observation,
  Filter,
  Changes,
  Form,
  FormProperties,
} from "./filter.types";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  event: Event = null;
  teamsById: TeamById = {};
  listeners: any = [];
  users: User[] = [];
  forms: Form[] = [];

  interval: Interval = {};
  filterLocalOffset = moment().format("Z");
  actionFilter: string = "";

  intervalChoices: FilterChoice[] = [
    {
      filter: "all",
      label: "All",
    },
    {
      filter: "today",
      label: "Today (Local GMT " + this.filterLocalOffset + ")",
    },
    {
      filter: 86400,
      label: "Last 24 Hours",
    },
    {
      filter: 43200,
      label: "Last 12 Hours",
    },
    {
      filter: 21600,
      label: "Last 6 Hours",
    },
    {
      filter: 3600,
      label: "Last Hour",
    },
    {
      filter: "custom",
      label: "Custom",
    },
  ];

  constructor(
    private userService: UserService,
    private localStorageService: LocalStorageService
  ) {
    this.setTimeInterval(
      localStorageService.getTimeInterval() || {
        choice: this.intervalChoices[1],
      }
    );
    this.filterChanged({ intervalChoice: this.interval.choice });
  }

  addListener(listener: any) {
    this.listeners.push(listener);

    if (typeof listener.onFilterChanged === "function") {
      listener.onFilterChanged({
        event: this.event,
        teams: Object.values(this.teamsById),
        user: this.users,
        timeInterval: {
          choice: this.interval.choice,
        },
      });
    }
  }

  removeListener(listener: any) {
    this.listeners = this.listeners.filter((l: any) => l !== listener);
  }

  setFilter(filter: Filter) {
    var eventChanged = null;
    var teamsChanged = null;
    var usersChanged = null;
    var formsChanged = null;
    var timeIntervalChanged = null;
    var actionFilterChanged = null;

    if (filter.users) usersChanged = this.setUsers(filter.users);

    if (filter.forms) formsChanged = this.setForms(filter.forms);

    if (filter.teams) {
      teamsChanged = this.setTeams(filter.teams);
    }

    if (filter.event) {
      eventChanged = this.setEvent(filter.event);

      // if they changed the event, and didn't set teams filter
      // then reset teams filter to empty array
      if (!filter.teams) {
        var oldTeamIds = this.localStorageService.getTeams() || [];
        var teams = [];
        for (var i = 0; i < filter.event.teams.length; i++) {
          if (oldTeamIds.indexOf(this.event.teams[i].id) != -1) {
            teams.push(this.event.teams[i]);
          }
        }
        teamsChanged = this.setTeams(teams);
      }
    }

    if (filter.actionFilter) {
      actionFilterChanged = filter.actionFilter;
      this.actionFilter = filter.actionFilter;
    }

    if (filter.timeInterval && this.setTimeInterval(filter.timeInterval)) {
      timeIntervalChanged = filter.timeInterval;
    }

    var changed: Changes = {};
    if (eventChanged) changed.event = eventChanged;
    if (teamsChanged) changed.teams = teamsChanged;
    if (usersChanged) changed.users = usersChanged;
    if (formsChanged) changed.forms = formsChanged;
    if (actionFilterChanged) changed.actionFilter = actionFilterChanged;
    if (timeIntervalChanged) changed.timeInterval = timeIntervalChanged;

    this.filterChanged(changed);
  }

  removeFilters() {
    var changed: Changes = {};
    if (this.event) {
      changed.event = { removed: [this.event] };
      this.event = null;
    }

    this.filterChanged(changed);
  }

  setEvent(newEvent: Event) {
    if (!newEvent && this.event) {
      this.event = null;

      return {
        added: [],
        removed: [this.event],
      };
    } else if ((newEvent && !this.event) || this.event.id !== newEvent.id) {
      var added = [newEvent];
      var removed = this.event ? [this.event] : [];

      this.userService.addRecentEvent(newEvent).subscribe({
        error: (e) => console.error("Error adding recent event", e),
      });

      this.event = newEvent;

      return {
        added: added,
        removed: removed,
      };
    } else {
      return null;
    }
  }

  getEvent(): Event {
    return this.event;
  }

  setUsers(newUsers: User[]) {
    var added = [];
    var removed = [];

    newUsers.forEach((user: User) => {
      if (this.users.findIndex((u) => u.id === user.id) < 0) added.push(user);
    });

    this.users.forEach((user: User) => {
      if (newUsers.findIndex((u) => u.id === user.id) < 0) removed.push(user);
    });

    this.users = newUsers;
    this.localStorageService.setUsers(this.users);

    return {
      added: added,
      removed: removed,
    };
  }

  setForms(newForms: Form[]) {
    var added = [];
    var removed = [];

    newForms.forEach((form: Form) => {
      if (this.forms.findIndex((f) => f.id === form.id) < 0) added.push(form);
    });

    this.forms.forEach((form: Form) => {
      if (newForms.findIndex((f) => f.id === form.id) < 0) removed.push(form);
    });

    this.forms = newForms;
    this.localStorageService.setForms(this.forms);

    return {
      added: added,
      removed: removed,
    };
  }

  setTeams(newTeams: Team[]) {
    var added = [];
    var removed = [];

    newTeams.forEach((team: Team) => {
      if (!this.teamsById[team.id]) {
        added.push(team);
      }
    });

    var newTeamsById = _.keyBy(newTeams, "id");
    Object.values(this.teamsById).forEach((team: Team) => {
      if (!newTeamsById[team.id]) {
        removed.push(team);
      }
    });

    this.teamsById = newTeamsById;
    this.localStorageService.setTeams(Object.keys(this.teamsById));

    return {
      added: added,
      removed: removed,
    };
  }

  getTeams() {
    return Object.values(this.teamsById);
  }

  getUsers() {
    return this.users;
  }

  getForms() {
    return this.forms;
  }

  getTeamsById() {
    return this.teamsById;
  }

  getIntervalChoice() {
    return this.interval.choice;
  }

  getInterval() {
    return this.interval;
  }

  setTimeInterval(newInterval: Interval) {
    if (newInterval.choice.filter === "custom") {
      if (
        this.interval.options?.startDate &&
        newInterval.options.startDate === this.interval.options?.startDate &&
        this.interval.options?.endDate &&
        newInterval.options.endDate === this.interval.options?.endDate
      ) {
        return false;
      }
    } else if (this.interval.choice === newInterval.choice) {
      return false;
    }
    this.localStorageService.setTimeInterval(newInterval);
    this.interval = newInterval;
    return true;
  }

  observationInFilter(o: Observation) {
    if (!this.isObservationInTimeFilter(o)) return false;

    if (!this.isUserInTeamFilter(o.userId)) return false;

    if (this.forms.length > 0 && !this.hasFormInList(o.properties.forms))
      return false;

    if (this.users.length > 0 && !this.isUserInList(o.userId)) return false;

    // remove observations that are not part of action filter
    if (this.actionFilter === "important" && !o.important) return false;

    if (
      this.actionFilter === "favorite" &&
      !o.favoriteUserIds.includes(this.userService.myself.id)
    )
      return false;

    if (this.actionFilter === "attachments" && !o.attachments.length)
      return false;

    return true;
  }

  isUserInList(observationUserId: string) {
    if (this.users.length <= 0) return true;
    return this.users.findIndex((u) => u.id === observationUserId) >= 0;
  }

  hasFormInList(observationForms: FormProperties[]) {
    if (this.forms.length <= 0) return true;
    var intersection = this.forms
      .map((x) => x.id)
      .filter((fID) => observationForms.map((y) => y.formId).includes(fID));
    return intersection.length > 0;
  }

  isObservationInTimeFilter(o: Observation) {
    var time = this.formatInterval(this.interval);
    if (time) {
      var properties = o.properties;
      if (time?.start && time?.end) {
        return moment(properties.timestamp).isBetween(time.start, time.end);
      } else if (time?.start) {
        return moment(properties.timestamp).isAfter(time.start);
      } else if (time?.end) {
        return moment(properties.timestamp).isBefore(time.start);
      }
    }
    return true;
  }

  isUserInTeamFilter(userId: string) {
    if (Object.keys(this.teamsById).length === 0) return true;
    return Object.values(this.teamsById).some((team: Team) =>
      team.userIds.includes(userId)
    );
  }

  formatInterval(interval: Interval) {
    if (!interval) return null;
    var choice = interval.choice;
    var options = interval.options;
    var start: string = null;
    var end: string = null;

    if (choice.filter === "all") {
      return null;
    } else if (choice.filter === "today") {
      start = moment().startOf("day").toISOString();
      end = moment().endOf("day").toISOString();
    } else if (choice.filter === "custom") {
      var startDate = moment(options.startDate);
      if (startDate) {
        startDate = options.localTime ? startDate.utc() : startDate;
        start = startDate.utc().toISOString();
      }
      var endDate = moment(options.endDate);
      if (endDate) {
        endDate = options.localTime ? endDate.utc() : endDate;
        end = endDate.utc().toISOString();
      }
    } else {
      start = moment()
        .utc()
        .subtract(
          typeof choice.filter === "string"
            ? parseInt(choice.filter)
            : choice.filter,
          "seconds"
        )
        .toISOString();
      end = moment().toISOString();
    }

    return { start: start, end: end };
  }

  filterChanged(filter: Changes) {
    this.listeners.forEach((listener: any) => {
      if (typeof listener.onFilterChanged === "function") {
        listener.onFilterChanged(filter);
      }
    });
  }
}
