import { Modal, Flex, Spin } from "antd";

const Spin2Wait = ({ onSpin, message }) => {
  return (
    <Modal footer={null} open={onSpin} closable={false} keyboard={false}>
      <Flex vertical align="center" gap="middle" justify="center">
        <Spin size="large" />
        <p>{message}</p>
      </Flex>
    </Modal>
  );
};

export default Spin2Wait;
