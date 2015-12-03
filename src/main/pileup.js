/**
 * This exposes the main entry point into pileup.js.
 * @flow
 */
'use strict';

import type {Track, VisualizedTrack, VizWithOptions} from './types';

import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';

// Data sources
import TwoBitDataSource from './TwoBitDataSource';
import BigBedDataSource from './BigBedDataSource';
import VcfDataSource from './VcfDataSource';
import BamDataSource from './BamDataSource';
import GA4GHDataSource from './GA4GHDataSource';
import EmptySource from './EmptySource';

// Visualizations
import CoverageTrack from './CoverageTrack';
import GenomeTrack from './GenomeTrack';
import GeneTrack from './GeneTrack';
import LocationTrack from './LocationTrack';
import PileupTrack from './PileupTrack';
import ScaleTrack from './ScaleTrack';
import VariantTrack from './VariantTrack';
import Root from './Root';

type GenomeRange = {
  contig: string;
  start: number;
  stop: number;
}

type Pileup = {
  setRange(range: GenomeRange): void;
  getRange(): GenomeRange;
  destroy(): void;
}

type PileupParams = {
  range: {
    contig: string,
    start: number,
    stop: number
  };
  tracks: Track[];
}

function findReference(tracks: VisualizedTrack[]): ?VisualizedTrack {
  return _.find(tracks, t => !!t.track.isReference);
}

function create(elOrId: string|Element, params: PileupParams): Pileup {
  var el = typeof(elOrId) == 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) {
    throw new Error(`Attempted to create pileup with non-existent element ${elOrId}`);
  }

  var vizTracks = params.tracks.map(function(track: Track): VisualizedTrack {
    var source = track.data ? track.data : track.viz.component.defaultSource;
    if(!source) {
      throw new Error(
        `Track '${track.viz.component.displayName}' doesn't have a default ` +
        `data source; you must specify one when initializing it.`
      );
    }

    return {visualization: track.viz, source, track};
  });

  var referenceTrack = findReference(vizTracks);
  if (!referenceTrack) {
    throw new Error('You must include at least one track with type=reference');
  }

  var reactElement =
      ReactDOM.render(<Root referenceSource={referenceTrack.source}
                            tracks={vizTracks}
                            initialRange={params.range} />, el);
  return {
    setRange(range: GenomeRange) {
      if (reactElement === null) {
        throw 'Cannot call setRange on a destroyed pileup';
      }
      reactElement.handleRangeChange(range);
    },
    getRange(): GenomeRange {
      if (reactElement === null) {
        throw 'Cannot call setRange on a destroyed pileup';
      }
      return _.clone(reactElement.state.range);
    },
    destroy(): void {
      if (!vizTracks) {
        throw 'Cannot call destroy() twice on the same pileup';
      }
      vizTracks.forEach(({source}) => {
        source.off();
      });
      ReactDOM.unmountComponentAtNode(el);
      reactElement = null;
      referenceTrack = null;
      vizTracks = null;
    }
  };
}

type VizObject = ((options: ?Object) => VizWithOptions);

function makeVizObject(component: ReactClass): VizObject {
  return options => {
    options = _.extend({}, component.defaultOptions, options);
    return {component, options};
  };
}

var pileup = {
  create: create,
  formats: {
    bam: BamDataSource.create,
    ga4gh: GA4GHDataSource.create,
    vcf: VcfDataSource.create,
    twoBit: TwoBitDataSource.create,
    bigBed: BigBedDataSource.create,
    empty: EmptySource.create
  },
  viz: {
    coverage: makeVizObject(CoverageTrack),
    genome:   makeVizObject(GenomeTrack),
    genes:    makeVizObject(GeneTrack),
    location: makeVizObject(LocationTrack),
    scale:    makeVizObject(ScaleTrack),
    variants: makeVizObject(VariantTrack),
    pileup:   makeVizObject(PileupTrack)
  },
  version: '0.6.1'
};

module.exports = pileup;

// Export a global until the distributed package works with CommonJS
// See https://github.com/hammerlab/pileup.js/issues/136
if (typeof window !== 'undefined') {
  window.pileup = pileup;
}
