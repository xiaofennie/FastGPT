import {
  Box,
  Button,
  Flex,
  Input,
  ModalBody,
  Switch,
  useDisclosure,
  IconButton,
  VStack,
  HStack
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import { useTranslation } from 'next-i18next';
import MyModal from '@fastgpt/web/components/common/MyModal';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';

const ButtonsSwitch = ({
  value = { open: false, metadata: [] },
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
      <MyIcon name={'core/app/simpleMode/promot'} mr={2} w={'20px'} />
      <FormLabel color={'myGray.600'}>底部快捷按钮</FormLabel>
      <Box flex={1} />
      <MyTooltip label={'配置底部快捷按钮'}>
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
        title={'底部快捷按钮'}
        iconSrc={'core/app/simpleMode/promot'}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalBody>
          <Flex flexDirection={'column'} gap={6}>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <FormLabel>开启底部快捷按钮</FormLabel>
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
                  <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <FormLabel mb={0}>快捷按钮</FormLabel>
                    <Button
                      size="sm"
                      onClick={() => {
                        onChange({
                          ...value,
                          metadata: [...value.metadata, '']
                        });
                      }}
                    >
                      添加
                    </Button>
                  </Flex>
                  <VStack spacing={2} align="stretch">
                    {value.metadata.map((item: any, index: number) => (
                      <HStack key={index} spacing={2}>
                        <Input
                          placeholder="值"
                          value={item}
                          onChange={(e) => {
                            const newMetadata = [...value.metadata];
                            newMetadata[index] = e.target.value;
                            onChange({
                              ...value,
                              metadata: newMetadata
                            });
                          }}
                        />
                        <IconButton
                          aria-label="删除"
                          variant="outline"
                          colorScheme="red"
                          icon={<MyIcon name="delete" w="14px" />}
                          size="sm"
                          onClick={() => {
                            const newMetadata = [...value.metadata];
                            newMetadata.splice(index, 1);
                            onChange({
                              ...value,
                              metadata: newMetadata
                            });
                          }}
                        />
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </>
            )}
          </Flex>
        </ModalBody>
      </MyModal>
    </Flex>
  );
};

export default ButtonsSwitch;
