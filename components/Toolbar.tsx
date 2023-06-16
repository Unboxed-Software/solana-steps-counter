import {StyleSheet, Text, View} from 'react-native';

export type ToolbarProps = {
  backgroundColor?: string;
  title?: string;
  titleColor?: string;
};

const toolbarStyleSheet = StyleSheet.create({
  container: {
    height: 64,
    width: '100%',
    elevation: 8,
  },

  title: {
    maxWidth: '50%',
    height: '100%',
    verticalAlign: 'middle',
    marginStart: 8,
    marginRight: 8,
  },
});

const Toolbar = (props: ToolbarProps): JSX.Element => {
  return (
    <View
      style={{
        ...toolbarStyleSheet.container,
        backgroundColor: props.backgroundColor ?? 'orange',
      }}>
      <Text
        style={{
          ...toolbarStyleSheet.title,
          color: props.titleColor ?? 'white',
        }}>
        {props.title ?? 'toolbar'}
      </Text>
    </View>
  );
};

export default Toolbar;
