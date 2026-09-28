/* Perfil do Hub Base e renderizador Blockly compartilhados pela IDE. */
(() => {
  'use strict';

  window.AXIOMA_HARDWARE_PROFILE = Object.freeze({
    id: 'axioma-hub-base-v1',
    version: 3,
    capabilities: [
      'motor.dc.open_loop.4', 'motor.brake_coast', 'motion.timed',
      'servo.position.2', 'sensor.port.6', 'imu.6axis', 'imu.heading',
      'display.rgb.240x240', 'audio.pcm', 'can.multi_hub', 'usb.device'
    ],
    hardware: {
      motors: 4, motor_encoder: false, motor_connector_pins: 2, servos: 2,
      sensor_ports: 6, can: true, imu: 'BMI270', display: 'ST7789-240x240'
    }
  });

  class AxiomaConnectionConstants extends Blockly.blockRendering.ConstantProvider {
    makeHexagonal() {
      const path = (height, down, right) => {
        const width = Math.min(height * .92, 28);
        const x = right ? width : -width;
        const y = (down ? 1 : -1) * height / 2;
        return `l ${x} ${y} l ${-x} ${y}`;
      };
      return {
        type: this.SHAPES.HEXAGONAL, isDynamic: true,
        width: height => Math.min(height * .92, 28), height: height => height,
        connectionOffsetY: height => height / 2, connectionOffsetX: height => -height,
        pathDown: height => path(height, true, false), pathUp: height => path(height, false, false),
        pathRightDown: height => path(height, true, true), pathRightUp: height => path(height, false, true)
      };
    }
  }

  class AxiomaRenderer extends Blockly.blockRendering.Renderer {
    makeConstants_() { return new AxiomaConnectionConstants(); }
  }

  Blockly.blockRendering.register('axioma', AxiomaRenderer);
  const baseInject = Blockly.inject;
  Blockly.inject = (container, options = {}) => baseInject(container, { ...options, renderer: 'axioma' });
})();
