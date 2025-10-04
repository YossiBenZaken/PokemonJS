import React from "react";
import { TerrainType } from "./AttackMap";

export interface MapProps {
  onTerrainClick: (terrainId: TerrainType) => void;
}

export const HoennMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <center>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(4)}
          src="/images/attackmap/hoenn/spookhuis.gif"
          alt="Torre Assombrada"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(1)}
          src="/images/attackmap/hoenn/lavagrot.gif"
          alt="Lava"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(3)}
          src="/images/attackmap/hoenn/grasveld_01.gif"
          alt="Grama"
        />
        <img src="/images/attackmap/hoenn/area_01.gif" alt="Grama" />
      </div>
      <div className="flex">
        <img src="/images/attackmap/hoenn/area_02.gif" alt="Grama" />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(3)}
          src="/images/attackmap/hoenn/grasveld.gif"
          alt="Grama"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(2)}
          src="/images/attackmap/hoenn/vechtschool.gif"
          alt="Dojô"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(6)}
          src="/images/attackmap/hoenn/water.gif"
          alt="Água"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(7)}
          src="/images/attackmap/hoenn/strand.gif"
          alt="Praia"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(5)}
          src="/images/attackmap/hoenn/grot.gif"
          alt="Gruta"
        />
      </div>
    </center>
  );
};

export const JohtoMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <center>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(5)}
          src="/images/attackmap/johto/grot.gif"
          alt="Gruta"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(2)}
          src="/images/attackmap/johto/vechtschool.gif"
          alt="Dojô"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(1)}
          src="/images/attackmap/johto/lavagrot.gif"
          alt="Lava"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(3)}
          src="/images/attackmap/johto/grasveld.gif"
          alt="Grama"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(7)}
          src="/images/attackmap/johto/strand.gif"
          alt="Praia"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(4)}
          src="/images/attackmap/johto/spookhuis.gif"
          alt="Torre Assombrada"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(6)}
          src="/images/attackmap/johto/water.gif"
          alt="Água"
        />
      </div>
    </center>
  );
};

export const KantoMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <center>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(3)}
          src="/images/attackmap/kanto/grasveld.gif"
          alt="Grama"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(5)}
          src="/images/attackmap/kanto/grot.gif"
          alt="Gruta"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(2)}
          src="/images/attackmap/kanto/vechtschool.gif"
          alt="Dojô"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(1)}
          src="/images/attackmap/kanto/lavagrot.gif"
          alt="Lava"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(7)}
          src="/images/attackmap/kanto/strand.gif"
          alt="Praia"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(4)}
          src="/images/attackmap/kanto/spookhuis.gif"
          alt="Torre Assombrada"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(6)}
          src="/images/attackmap/kanto/water.gif"
          alt="Água"
        />
      </div>
    </center>
  );
};

export const SinnohMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <center>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(6)}
          src="/images/attackmap/sinnoh/water.gif"
          alt="Água"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(5)}
          src="/images/attackmap/sinnoh/grot.gif"
          alt="Gruta"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(4)}
          src="/images/attackmap/sinnoh/spookhuis.gif"
          alt="Torre Assombrada"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(6)}
          src="/images/attackmap/sinnoh/water2.gif"
          alt="Água"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(2)}
          src="/images/attackmap/sinnoh/vechtschool.gif"
          alt="Dojô"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(7)}
          src="/images/attackmap/sinnoh/strand.gif"
          alt="Praia"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(1)}
          src="/images/attackmap/sinnoh/lavagrot.gif"
          alt="Lava"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(3)}
          src="/images/attackmap/sinnoh/grasveld.gif"
          alt="Grama"
        />
      </div>
    </center>
  );
};

export const UnovaMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <center>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(1)}
          src="/images/attackmap/unova/lavagrot.gif"
          alt="Lava"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(5)}
          src="/images/attackmap/unova/grot.gif"
          alt="Gruta"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(4)}
          src="/images/attackmap/unova/spookhuis.gif"
          alt="Torre Assombrada"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(3)}
          src="/images/attackmap/unova/grasveld.gif"
          alt="Grama"
        />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(2)}
          src="/images/attackmap/unova/vechtschool.gif"
          alt="Dojô"
        />
      </div>

      <div className="flex">
        <img src="/images/attackmap/unova/port.gif" alt="Praia" />
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(7)}
          src="/images/attackmap/unova/strand.gif"
          alt="Praia"
        />
      </div>
      <div className="flex">
        <img
          className="cursor-pointer"
          onClick={() => onTerrainClick(6)}
          src="/images/attackmap/unova/water.gif"
          alt="Água"
        />
      </div>
    </center>
  );
};

export const KalosMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <center>
      <img
        src="/images/attackmap/kalos/Kalos.gif"
        width="593"
        height="807"
        useMap="#kalos"
        id="kalos"
        alt="Kalos"
      />
      <map name="kalos" id="kalos">
        {/* Ghost House */}
        <area
          shape="rect"
          coords="300,101,399,314"
          alt="Torre Assombrada"
          onClick={() => onTerrainClick(4)}
          className="cursor-pointer"
        />
        {/* Grass */}
        <area
          shape="rect"
          coords="0,194,302,332"
          alt="Grama"
          onClick={() => onTerrainClick(3)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="149,550,496,664"
          alt="Grama"
          onClick={() => onTerrainClick(3)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="150,429,476,550"
          alt="Grama"
          onClick={() => onTerrainClick(3)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="244,312,474,429"
          alt="Grama"
          onClick={() => onTerrainClick(3)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="398,224,474,313"
          alt="Grama"
          onClick={() => onTerrainClick(3)}
          className="cursor-pointer"
        />

        {/* Lava */}
        <area
          shape="rect"
          coords="0,0,593,104"
          alt="Lava"
          onClick={() => onTerrainClick(1)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="395,99,593,225"
          alt="Lava"
          onClick={() => onTerrainClick(1)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="0,0,302,217"
          alt="Lava"
          onClick={() => onTerrainClick(1)}
          className="cursor-pointer"
        />

        {/* Water */}
        <area
          shape="rect"
          coords="0,327,100,487"
          alt="Água"
          onClick={() => onTerrainClick(6)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="67,402,153,487"
          alt="Água"
          onClick={() => onTerrainClick(6)}
          className="cursor-pointer"
        />

        {/* Cave */}
        <area
          shape="rect"
          coords="473,222,593,807"
          alt="Gruta"
          onClick={() => onTerrainClick(5)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="0,661,593,807"
          alt="Gruta"
          onClick={() => onTerrainClick(5)}
          className="cursor-pointer"
        />

        {/* Dojo */}
        <area
          shape="rect"
          coords="1,485,150,662"
          alt="Dojô"
          onClick={() => onTerrainClick(2)}
          className="cursor-pointer"
        />

        {/* Beach */}
        <area
          shape="rect"
          coords="95,329,253,404"
          alt="Praia"
          onClick={() => onTerrainClick(7)}
          className="cursor-pointer"
        />
        <area
          shape="rect"
          coords="152,346,244,430"
          alt="Praia"
          onClick={() => onTerrainClick(7)}
          className="cursor-pointer"
        />
      </map>
    </center>
  );
};

export const AlolaMap = (props: MapProps) => {
  const { onTerrainClick } = props;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 590, height: 798 }} className="attack_map">
        <div style={{ float: "left", width: 209, height: 227 }}>
          <div style={{ float: "left", width: 144, height: 64 }}>
            <input
              type="image"
              src="/images/attackmap/alola/Floresta.gif"
              alt="Grama"
              onClick={() => onTerrainClick(3)}
            />
          </div>

          <div style={{ float: "left", width: 65, height: 64 }}>
            <div style={{ float: "left", width: 65, height: 48 }}>
              <input
                type="image"
                src="/images/attackmap/alola/Grama2.gif"
                alt="Grama"
                onClick={() => onTerrainClick(3)}
              />
            </div>
            <div style={{ float: "left", width: 65, height: 16 }}>
              <input
                type="image"
                src="/images/attackmap/alola/Grama.gif"
                alt="Grama"
                onClick={() => onTerrainClick(3)}
              />
            </div>
          </div>

          <div style={{ float: "left", width: 209, height: 163 }}>
            <input
              type="image"
              src="/images/attackmap/alola/Grama2.gif"
              alt="Grama"
              onClick={() => onTerrainClick(3)}
            />
          </div>
        </div>

        <div style={{ float: "left", width: 176, height: 227 }}>
          <div style={{ float: "left", width: 176, height: 160 }}>
            <input
              type="image"
              src="/images/attackmap/alola/Gruta.gif"
              alt="Gruta"
              style={{ marginTop: 0 }}
              onClick={() => onTerrainClick(5)}
            />
          </div>
          <img
            style={{ float: "left", width: 34, height: 67 }}
            src="/images/attackmap/alola/Caminho.gif"
            alt="Road"
          />
          <img
            style={{ float: "left", width: 126, height: 67 }}
            src="/images/attackmap/alola/Caminho2.gif"
            alt="Road"
          />
          <div style={{ float: "left", width: 16, height: 67 }}>
            <input
              type="image"
              src="/images/attackmap/alola/Floresta3.gif?n"
              onClick={() => onTerrainClick(3)}
              alt="Grama"
            />
          </div>
        </div>

        <div style={{ float: "left", width: 205, height: 160 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Lava.gif"
            alt="Lava"
            onClick={() => onTerrainClick(1)}
          />
        </div>

        <div style={{ float: "left", width: 205, height: 67 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Floresta4.gif"
            alt="Grama"
            onClick={() => onTerrainClick(3)}
          />
        </div>

        <div style={{ float: "left", width: 243, height: 238 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Torre.gif"
            alt="Torre Fantasma"
            onClick={() => onTerrainClick(4)}
          />
        </div>

        <div style={{ float: "left", width: 126, height: 238 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Dojo.gif"
            alt="Dojô"
            onClick={() => onTerrainClick(2)}
          />
        </div>

        <div style={{ float: "left", width: 221, height: 125 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Floresta5.gif"
            alt="Grama"
            onClick={() => onTerrainClick(3)}
          />
        </div>

        <img
          style={{ float: "left", width: 221, height: 113, marginTop: -2 }}
          src="/images/attackmap/alola/Caminho3.gif"
          alt="Road"
        />

        <div style={{ float: "left", width: 590, height: 45 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Praia.gif"
            alt="Praia"
            onClick={() => onTerrainClick(7)}
          />
        </div>

        <div style={{ float: "left", width: 332, height: 45 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Praia2.gif"
            alt="Praia"
            onClick={() => onTerrainClick(7)}
          />
        </div>

        <div style={{ float: "left", width: 45, height: 45 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Gruta2.gif"
            alt="Gruta"
            onClick={() => onTerrainClick(5)}
          />
        </div>

        <div style={{ float: "left", width: 213, height: 45 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Praia3.gif"
            alt="Praia"
            onClick={() => onTerrainClick(7)}
          />
        </div>

        <div style={{ float: "left", width: 590, height: 36 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Praia4.gif"
            alt="Praia"
            onClick={() => onTerrainClick(7)}
          />
        </div>

        <div style={{ float: "left", width: 89, height: 79 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Agua.gif"
            alt="Água"
            onClick={() => onTerrainClick(6)}
          />
        </div>

        <div style={{ float: "left", width: 132, height: 79 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Praia5.gif"
            alt="Praia"
            onClick={() => onTerrainClick(7)}
          />
        </div>

        <div style={{ float: "left", width: 369, height: 79 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Agua2.gif"
            alt="Água"
            onClick={() => onTerrainClick(6)}
          />
        </div>

        <div style={{ float: "left", width: 590, height: 130 }}>
          <input
            type="image"
            src="/images/attackmap/alola/Agua3.gif"
            alt="Água"
            onClick={() => onTerrainClick(6)}
          />
        </div>
      </div>
    </div>
  );
};
