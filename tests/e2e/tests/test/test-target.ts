import { ng } from '../../utils/process';
import { updateJsonFile } from '../../utils/project';

export default function () {
  return updateJsonFile('tsconfig.json', configJson => {
    // Updates tsconfig.json with new target setting.
    const compilerOptions = configJson['compilerOptions'];
    compilerOptions['target'] = 'es2015';
  })
    .then(() => updateJsonFile('src/tsconfig.spec.json', configJson => {
      // Updates tsconfig.spec.json file.
      const compilerOptions = configJson['compilerOptions'];
      compilerOptions['target'] = 'es2015';
    }))
    .then(() => ng('test', '--single-run'));
}
