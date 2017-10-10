/**
 * WeChat FE case interview - LazyMan
 *
 * Implementation via Promise by Cyandev.
 * Created on 17/10/10.
 */

const { EventEmitter } = require('events');

class LazyMan extends EventEmitter {

  constructor(name) {
    super();

    console.log(`Hi! This is ${name}!`);

    // Create a deferred Promise. This will be resolved when `_execute` is called,
    // which can cause other promises linked behind to start executing.
    this.promise_ = new Promise(resolve => {
      this.resolve_ = () => {
        if (this.sleepFirst_) {
          setTimeout(() => {
            this._printWakeUpMessage(this.sleepFirst_);
            resolve();
          }, this.sleepFirst_);
        } else {
          resolve();
        }
      };
    });

    // Register for next event loop.
    setImmediate(() => this._execute());
  }

  /* Publics */

  eat(what) {
    this.promise_ = this.promise_.then(() => {
      console.log(`Eat ${what}~`);
    });

    return this;
  }

  sleepFirst(ms) {
    this.sleepFirst_ = (this.sleepFirst_ | 0) + ms;

    return this;
  }

  sleep(ms) {
    this.promise_ = this.promise_.then(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          this._printWakeUpMessage(ms);
          resolve();
        }, ms);
      });
    });

    return this;
  }

  /* Privates */

  _printWakeUpMessage(ms) {
    console.log(`Wake up after ${ms}`);
  }

  _execute() {
    this.promise_.then(() => {
      this.emit('end');
    });

    if (this.resolve_) {
      this.resolve_();
    }  
  }

}


/**
 * Example:
 *
 * new LazyMan('Peter')
 *   .sleepFirst(2000)
 *   .eat('Breakfast')
 *   .sleep(3000)
 *   .eat('Dinner');
 */

module.exports = LazyMan;