import { Errors, SessionEvents, PlayerEvents, GameEvents, Events } from '@wah/lib';
import Vue from 'vue';
import { Socket } from 'vue-socket.io-extended';
import Component from 'vue-class-component';

class ErrorCallbacks {
  callbacks: Map<String, Map<Errors, Array<Function>>>

  constructor() {
    this.callbacks = new Map();
  }

  on(err: Errors, cb: Function, target: Object) {
    const targetName = target.constructor.name;
    if (!this.callbacks.has(targetName)) {
      this.callbacks.set(targetName, new Map());
    }


    if (!this.callbacks.get(targetName)?.has(err)) {
      this.callbacks.get(targetName)?.set(err, new Array());
    }
    this.callbacks.get(targetName)?.get(err)?.push(cb);
  }

  clearTarget(target: Object) {
    const targetName = target.constructor.name;
    if (this.callbacks.has(targetName)) {
      this.callbacks.delete(targetName);
    }
  }

  trigger(err: Errors, target: Object) {
    const targetName = target.constructor.name;

    if (this.callbacks.has(targetName) && this.callbacks.get(targetName)?.has(err)) {
      console.log('Triggering callbacks for ' + targetName + ' for event ' + err);
      this.callbacks.get(targetName)?.get(err)?.forEach((cb) => {
        cb.apply(target);
      });
    }
  }
}

const errCallBacks = new ErrorCallbacks();
export function Error(err: Errors) {

  return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const method = descriptor.value;
    errCallBacks.on(err, method, target);
    return descriptor;
  }
}

@Component
export class ErrorMixin extends Vue {

  beforeDestroy() {
    errCallBacks.clearTarget(this);
  }

  @Socket(SessionEvents.ERROR)
  onSessionError(err: Errors): void {
    errCallBacks.trigger(err, this);
    // console.error('Session error: ', err);
  }

  @Socket(PlayerEvents.ERROR)
  onPlayerError(err: Errors): void {
    errCallBacks.trigger(err, this);
  }

  @Socket(GameEvents.ERROR)
  onGameError(err: Errors): void {
    errCallBacks.trigger(err, this);
  }

  @Socket(Events.ERROR)
  onError(err: Errors): void {
    errCallBacks.trigger(err, this);
  }
}

