import rmdir from 'rmdir';
import * as path from "path";
import * as os from "os";
import * as https from "https";
import * as zlib from "zlib";
import * as fs from 'fs';
import * as http from 'http';
import tar, { Headers, } from 'tar-fs';
import mv from 'mv';
import { get, set, } from 'lodash';

function removeDir(dir: string): Promise<any> {
  return new Promise((resolve, reject) => {
    rmdir(dir, e => e ? reject(e) : resolve());
  });
}

const API_BASE = 'http://registry.npmjs.org/';

interface PackageHeader {
  name: string;
}

function formatPackageFile(header: Headers): Headers {
  return {
    ...header,
    name: header.name.replace(/^package\//, ''),
  } as Headers;
}

function installPackage(targetPath: string, destination: string, middleware: () => Promise<any>) {
  console.log(`Extract ${targetPath} to ${destination}`);
  return new Promise((resolve, reject) => {
    const packageName = path.parse(destination).name;
    const tempPath = `${os.tmpdir()}/${packageName}`;
    console.log(`Download and extract to temp path: ${tempPath}`);
    https.get(targetPath, stream => {
      const result = stream
        .pipe(zlib.createUnzip())
        .pipe(tar.extract(tempPath, {
          map: formatPackageFile,
        }));

      result.on('error', reject);
      result.on('finish', () => {
        middleware()
          .then(() => {
            console.log(`Move ${tempPath} to ${destination}`);
            mv(tempPath, destination, err => err ? reject(err) : resolve());
          });
      });
    });
  });
}

interface InstallOptions {
  version: string;
  middleware: () => Promise<void>;
}

interface Npm {
  install: (name: string, options: InstallOptions) => Promise<any>;
  update: (name: string) => Promise<any>;
  uninstall: (name: string) => Promise<any>;
}

interface PackageJson {
  dependencies: object;
}

export default function npm(dir: string): Npm {
  const packageJson = path.join(dir, 'package.json');
  const setConfig = (config: object): void => (
    fs.writeFileSync(packageJson, JSON.stringify(config, null, 2))
  );

  const getConfig = (): PackageJson => JSON.parse(fs.readFileSync(packageJson).toString()) as PackageJson;

  return {
    // Install an npm package without resolving its dependencies
    // All plugins should be properly bundled with webpack
    install(name: string, options: InstallOptions = {} as InstallOptions): Promise<any> {
      let versionToInstall: string;
      const version = options.version || null;
      const middleware = options.middleware || ((): Promise<void> => Promise.resolve());
      console.group(`[npm] Install package`, name);
      return new Promise((resolve, reject) => {
        http.get(`${API_BASE}${name}`, response => {
          response.on('data', data => {
            try {
              const json = data.toString();
              const packageInformation = JSON.parse(json);
              versionToInstall = version || packageInformation['dist-tags'].latest;
              console.log(`Version: ${versionToInstall}`);
              installPackage(
                packageInformation.versions[versionToInstall].dist.tarball,
                path.join(dir, 'node_modules', name),
                middleware
              )
                .then(() => {
                  const json = getConfig();
                  set(json, `dependencies.${name}`, versionToInstall);
                  console.log(`Add package to dependencies`);
                  setConfig(json);
                  console.groupEnd();
                })
                .catch(e => {
                  throw e;
                });
            } catch (e) {
              console.log(`Error in package ${name} installation`);
              console.log(e);
              reject(e);
            }
          });
        });
      });
    },
    update(name: string): Promise<any> {
      const middleware = (): Promise<any> => this.uninstall();
      return this.install(name, {
        middleware,
      });
    },
    uninstall(name: string): Promise<any> {
      const modulePath = path.join(dir, 'node_modules', name);
      console.group(`[npm] uninstall package`, name);
      console.log('Remove package directory', modulePath);

      return removeDir(modulePath)
        .then(() => {
          const json = getConfig();
          console.log('Update package.json');
          json.dependencies = Object.keys(json.dependencies)
            .filter(key => key !== name)
            .reduce((updatedDependencies, dependency) => ({
              ...updatedDependencies,
              [dependency]: get(json, `dependencies.${dependency}`),
            }), {});

          console.log('Rewrite package.json');

          setConfig(json);
          console.groupEnd();

          return true;
        })
        .catch(e => {
          console.log(`Error in package uninstallation`);
          console.log(e);
          console.groupEnd();
        });
    },
  };
}
