import { Injectable } from "@angular/core";
import { polygon } from "@turf/helpers";
import kinks from '@turf/kinks'

@Injectable({
  providedIn: 'root'
})
export class GeometryService {
  featureHasIntersections(feature) {
    if (!Array.isArray(feature.geometry.coordinates[0]) || feature.geometry.coordinates[0].length < 4) {
      return false;
    }

    const ks = kinks(polygon(feature.geometry.coordinates));

    return ks.features.length !== 0;
  }
}