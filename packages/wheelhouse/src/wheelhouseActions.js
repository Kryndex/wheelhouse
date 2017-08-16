/**
 * Main Wheelhouse actions. The main CLI commands map 1-1 with these. If you're going to build
 * a non-CLI interface into Wheelhouse, it could call these functions.
 */

import { configInit } from "./configActions";
import { serverStart } from "./serverActions";
import { helmBuild } from "./helmActions";
import {
  packagesInit,
  packagesLink,
  packagesInstall,
  packagesStart,
  packagesBuild,
  packagesCleanup
} from "./packagesActions";
import { dockerInit, dockerBuild, dockerPush } from "./dockerActions";
import { s3Init } from "./s3Actions";
import { developmentLog } from "./developmentActions";
import { kubernetesStartPullingData } from "./kubernetesActions";
import { run } from "./util/run";

/**
 * Runs on Wheelhouse startup for every other action.
 */
export const wheelhouseInit = () => async (dispatch, getState) => {
  await dispatch(configInit());
  await dispatch(packagesInit());
  await dispatch(dockerInit());
};

/**
 * wheelhouse install
 */
export const wheelhouseInstall = () => async (dispatch, getState) => {
  await dispatch(wheelhouseInit());
  await dispatch(packagesInstall());
};

/**
 * wheelhouse link
 */
export const wheelhouseLink = () => async (dispatch, getState) => {
  await dispatch(wheelhouseInit());
  await dispatch(packagesLink());
};

/**
 * wheelhouse start/run/dev
 */
export const wheelhouseStart = opts => async (dispatch, getState) => {
  const { script, disableKube, startApps } = opts;
  await dispatch(wheelhouseInit());
  // Start implies link.
  await dispatch(wheelhouseLink());

  await dispatch(serverStart());

  // #hack this exists for the `run/stage` C-SATS dev environment
  if (script) {
    // The selected script runs in parallel with us. No await.
    dispatch(wheelhouseStartupScript(script));
  }

  await dispatch(packagesStart(startApps));

  if (!disableKube) {
    dispatch(kubernetesStartPullingData());
  }
};

// #hack for C-SATS `run/stage` script to run on start. should have a better way to do "run this
// script on this file" soon
export const wheelhouseStartupScript = script => async (dispatch, getState) => {
  const args = script.split(" ");
  const cmd = args.shift();
  await run("npm", ["run", cmd, "--", ...args], {
    stdout: line => dispatch(developmentLog("run", line)),
    stderr: line => dispatch(developmentLog("run", line)),
    cwd: getState().config.rootDir
  });
};

/**
 * wheelhouse build
 */
export const wheelhouseBuild = () => async dispatch => {
  await dispatch(wheelhouseInit());
  await dispatch(s3Init());
  await dispatch(packagesBuild());
  await dispatch(dockerBuild());
  await dispatch(helmBuild());
  await dispatch(packagesCleanup());
};

export const wheelhousePush = () => async dispatch => {
  await dispatch(wheelhouseInit());
  await dispatch(dockerPush());
};

/**
 * wheelhouse set-version
 */
// export const wheelhouseBuild = () => async (dispatch, getState) => {
//   await dispatch(wheelhouseInit());
//   await dispatch(packagesBuild());
//   await dispatch(dockerBuild());
// };
