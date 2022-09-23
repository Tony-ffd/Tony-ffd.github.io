# spring源码学习笔记

> [黑马程序员深入讲解spring5底层原理]:https://www.bilibili.com/video/BV1P44y1N7QG?p=1

## 1、BeanFactory和ApplicationContext

`BeanFactory`是`ApplicationContext`中的一个变量，默认的实现类是`DefaultListableBeanFactory`，我们常说的bean对象池也就是该类中的`singletonObjects`变量。ApplicationContext中的getBean等操作bean对象的方法就是使用BeanFactory中的相关方法的实现。

![image-20220326200507397](D:\home\document\node\images\image-20220326200507397.png)

![image-20220326201106230](D:\home\document\node\images\image-20220326201106230.png)

再看看`applicationContext`中的其它几个实现接口的相关功能：

![image-20220326201746978](D:\home\document\node\images\image-20220326201746978.png)

~~~java
@SpringBootApplication
public class SpringSourceCodeLearnApplication {
    public static void main(String[] args) throws IOException {
        ConfigurableApplicationContext applicationContext = SpringApplication.run(SpringSourceCodeLearnApplication.class, args);
        //MessageSource 接口
        applicationContext.getMessage("hi",null, Locale.CHINESE);
        //ResourcePatternResolver 接口
        applicationContext.getResources("classpath*:appl|ication.yml");
        //EnvironmentCapable 接口 （获取环境变量和参数不区分大小写）
        applicationContext.getEnvironment().getProperty("java_home");
        //
        applicationContext.publishEvent(SpringSourceCodeLearnApplication.class);
    }

    @EventListener(SpringSourceCodeLearnApplication.class)
    public void exc(){
        System.out.println("监听到事件");
    }

}
~~~

