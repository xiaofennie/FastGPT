import {
  Box,
  Button,
  Flex,
  Textarea,
  ModalBody,
  Switch,
  useDisclosure,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Grid
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import { useTranslation } from 'next-i18next';
import MyModal from '@fastgpt/web/components/common/MyModal';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';

const MemorySwitch = ({
  value = { open: false, metadata: '', limit: 10, minScore: 0.8 },
  onChange
}: {
  value?: any;
  onChange: (e: any) => void;
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formLabel = value.open ? '开启' : '关闭';

  return (
    <Flex alignItems={'center'}>
      <MyIcon name={'core/app/simpleMode/ai'} mr={2} w={'20px'} />
      <FormLabel color={'myGray.600'}>记忆功能</FormLabel>
      <Box flex={1} />
      <MyTooltip label={'配置记忆功能'}>
        <Button
          variant={'transparentBase'}
          size={'sm'}
          mr={'-5px'}
          color={'myGray.600'}
          onClick={onOpen}
        >
          {formLabel}
        </Button>
      </MyTooltip>

      <MyModal
        title={'记忆功能'}
        iconSrc={'core/app/simpleMode/ai'}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalBody>
          <Flex flexDirection={'column'} gap={6}>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <FormLabel>开启记忆功能</FormLabel>
              <Switch
                isChecked={value.open}
                onChange={(e) => {
                  onChange({
                    ...value,
                    open: e.target.checked
                  });
                }}
              />
            </Flex>

            {value.open && (
              <>
                <Box>
                  <FormLabel mb={1}>限制条数</FormLabel>
                  <NumberInput
                    size="sm"
                    min={1}
                    max={100}
                    value={value.limit}
                    onChange={(valueString) => {
                      onChange({
                        ...value,
                        limit: Number(valueString)
                      });
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                <Box>
                  <FormLabel mb={1}>最低相关度</FormLabel>
                  <NumberInput
                    size="sm"
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    value={value.minScore}
                    onChange={(valueString) => {
                      onChange({
                        ...value,
                        minScore: Number(valueString)
                      });
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                <Box>
                  <FormLabel mb={1}>关键字</FormLabel>
                  <Textarea
                    rows={4}
                    placeholder="请输入关键字，填写key-value健值对"
                    value={value.metadata || ''}
                    onChange={(e) => {
                      onChange({
                        ...value,
                        metadata: e.target.value
                      });
                    }}
                  />
                </Box>
              </>
            )}
          </Flex>
        </ModalBody>
      </MyModal>
    </Flex>
  );
};

export default MemorySwitch;
