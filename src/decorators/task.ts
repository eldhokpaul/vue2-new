import { useTask } from "vue-concurrency";
import Vue, { ComponentOptions } from 'vue'
import type { DefaultData } from 'vue/types/options'
import { createDecorator } from 'vue-class-component'

export const Task = (taskKey: string) =>
  createDecorator(
    (options: ComponentOptions<Vue, DefaultData<Vue>>, key: string) => {
      if (!options.methods) { throw new Error('No methods found to apply task to') }
      const originalMethod = options.methods?.[key];
      if (!originalMethod) {
        throw "not found";
      }
      const wrappedFunction = useTask(function* (signal: any, ...args: any[]) {
        yield originalMethod.apply(signal, args);
      });
      if (!options.computed) options.computed = {};
      options.computed[taskKey] = function () {
        return Vue.observable(wrappedFunction.drop());
      };
      options.methods[key] = function (...args: any[]) {
        return wrappedFunction.perform(this, ...args);
      };
    }
  )
