import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canEditOutput,
  resolveOutputBackTarget,
} from "../src/navigation/outputPresentation.ts";
import {
  shouldCloseHistory,
  shouldOpenHistory,
} from "../src/gestures/verticalSheetGesture.ts";
import {
  getListeningVisualState,
  shouldAnimateListeningStage,
} from "../src/flows/listeningVisualState.ts";
import { getOutputTitleMetrics } from "../src/layout/outputTitleLayout.ts";

describe("output presentation", () => {
  it("returns generated outputs to the listening screen", () => {
    const presentation = { mode: "editable", origin: "generation" };

    assert.equal(resolveOutputBackTarget(presentation), "listening");
    assert.equal(canEditOutput(presentation), true);
  });

  it("returns completed history outputs to history in read-only mode", () => {
    const presentation = {
      mode: "readOnly",
      origin: "history",
      historyOffset: 248,
    };

    assert.equal(resolveOutputBackTarget(presentation), "history");
    assert.equal(canEditOutput(presentation), false);
  });
});

describe("history gestures", () => {
  it("opens history for an intentional upward swipe", () => {
    assert.equal(
      shouldOpenHistory({
        translationX: 8,
        translationY: -80,
        velocityY: -320,
      }),
      true,
    );
  });

  it("opens history for a fast upward flick", () => {
    assert.equal(
      shouldOpenHistory({
        translationX: 4,
        translationY: -34,
        velocityY: -810,
      }),
      true,
    );
  });

  it("rejects horizontal and incidental home gestures", () => {
    assert.equal(
      shouldOpenHistory({
        translationX: 40,
        translationY: -90,
        velocityY: -900,
      }),
      false,
    );
    assert.equal(
      shouldOpenHistory({
        translationX: 3,
        translationY: -28,
        velocityY: -180,
      }),
      false,
    );
  });

  it("closes history only from the top of the list", () => {
    const swipe = {
      translationX: 6,
      translationY: 96,
      velocityY: 410,
    };

    assert.equal(shouldCloseHistory({ ...swipe, scrollOffsetY: 0 }), true);
    assert.equal(shouldCloseHistory({ ...swipe, scrollOffsetY: 20 }), false);
  });

  it("closes history for a fast downward flick without stealing horizontal gestures", () => {
    assert.equal(
      shouldCloseHistory({
        translationX: 5,
        translationY: 30,
        velocityY: 920,
        scrollOffsetY: 0,
      }),
      true,
    );
    assert.equal(
      shouldCloseHistory({
        translationX: 38,
        translationY: 100,
        velocityY: 920,
        scrollOffsetY: 0,
      }),
      false,
    );
  });
});

describe("listening presentation", () => {
  it("keeps idle, starting, and recording in one stable stage", () => {
    assert.deepEqual(getListeningVisualState("idle"), {
      orbState: "idle",
      status: null,
      interactive: true,
    });
    assert.deepEqual(getListeningVisualState("starting"), {
      orbState: "starting",
      status: null,
      interactive: false,
    });
    assert.deepEqual(getListeningVisualState("recording"), {
      orbState: "recording",
      status: null,
      interactive: true,
    });

    assert.equal(shouldAnimateListeningStage("idle", "starting"), false);
    assert.equal(shouldAnimateListeningStage("starting", "recording"), false);
    assert.equal(shouldAnimateListeningStage("recording", "stopping"), false);
  });

  it("uses status copy only for processing work", () => {
    assert.deepEqual(getListeningVisualState("transcribing"), {
      orbState: "processing",
      status: "Transcribing your note",
      interactive: false,
    });
  });
});

describe("output title layout", () => {
  it("uses compact wrapping metrics on narrow phones", () => {
    assert.deepEqual(getOutputTitleMetrics(320), {
      fontSize: 24,
      lineHeight: 30,
    });
    assert.deepEqual(getOutputTitleMetrics(360), {
      fontSize: 24,
      lineHeight: 30,
    });
  });

  it("uses the standard title scale on wider phones", () => {
    assert.deepEqual(getOutputTitleMetrics(375), {
      fontSize: 27,
      lineHeight: 34,
    });
  });
});
