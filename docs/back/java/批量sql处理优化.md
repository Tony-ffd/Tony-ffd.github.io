---
author: Tony-ffd
date: 2022-09-23
category: Spring
tag: Spring,Java
---
# 批量sql处理优化

## mysql

### 存储过程

- 正常存储过程插入1w条      时间：14s484ms

  ~~~mysql
  create table batch_demo
  (
      id          int         not null comment 'id'
          primary key,
      batch_name  varchar(32) null,
      batch_value varchar(32) null
  )
      comment '批量处理测试表';
  
  drop procedure if exists gen_data;
  
  delimiter $$
  
  create procedure gen_data(in size int)
  begin
      #分页提交大小
      declare page_size int default 1000;
      #下标
      declare i int default 1;
      out_while:while i < size do
          set i = i + 1;
          insert into batch_demo(id, batch_name, batch_value) value (i,concat('name',i),concat('value',i));
      end while ;
  end $$
  delimiter ;
  
  call gen_data(10000);
  ~~~

- 存储过程使用内存表优化添加1w条数据      时间： 98ms

  ~~~mysql
  create table batch_demo
  (
      id          int         not null comment 'id'
          primary key,
      batch_name  varchar(32) null,
      batch_value varchar(32) null
  )
      comment '批量处理测试表';
  
  create temporary table batch_demo_temp
  (
      id          int         not null comment 'id'
          primary key,
      batch_name  varchar(32) null,
      batch_value varchar(32) null
  ) engine = MEMORY
      comment '批量处理测试表暂存表';
  
  drop procedure if exists gen_data;
  
  delimiter $$
  
  create procedure gen_data(in size int)
  begin
      #分页提交大小
      declare page_size int default 1000;
      #下标
      declare i int default 1;
      out_while:while i < size do
          set i = i + 1;
          insert into batch_demo_temp(id, batch_name, batch_value) value (i,concat('name',i),concat('value',i));
      end while ;
      insert into batch_demo select * from batch_demo_temp;
  end $$
  delimiter ;
  
  call gen_data(10000);
  ~~~
  
  > 注意：暂存表使用会有大小限制，默认为16M，可以调节my.ini文件或者`transaction_alloc_block_size`全局常量改变限制。但是个人不建议这样操作，在批量存储前可以将数据分片再存。
  
  - 事务控制改为手动，并分片控制       时间：346ms
  
    ~~~mysql
    create table batch_demo
    (
        id          int         not null comment 'id'
            primary key,
        batch_name  varchar(32) null,
        batch_value varchar(32) null
    )
        comment '批量处理测试表';
        
    drop procedure if exists gen_data;
    delimiter $$
    
    create procedure gen_data(in size int)
    begin
        #分页提交大小
        declare page_size int default 1000;
        #下标
        declare i int default 1;
        #开启事务
        start transaction ;
        out_while:while i < size do
            set i = i + 1;
            if 0 <> i % page_size then
                insert into batch_demo(id, batch_name, batch_value) value (i,concat('name',i),concat('value',i));
            else
                commit ;
                start transaction ;
            end if ;
        end while ;
        commit ;
    end $$
    delimiter ;
    ~~~
  
    
  
    ### jdbc
  
    ~~~java
    import lombok.SneakyThrows;
    import lombok.extern.slf4j.Slf4j;
    import org.junit.jupiter.api.AfterEach;
    import org.junit.jupiter.api.BeforeEach;
    import org.junit.jupiter.api.Test;
    import org.springframework.boot.test.context.SpringBootTest;
    
    import javax.annotation.Resource;
    import javax.sql.DataSource;
    import java.sql.*;
    import java.util.concurrent.*;
    
    @SpringBootTest
    @Slf4j
    @SuppressWarnings("uncheck")
    class TestJdbcDemo {
        @Resource
        private DataSource dataSource;
        private Connection connection;
    
    
        @BeforeEach
        @SneakyThrows
        void before(){
            log.debug("初始化！");
            this.connection = dataSource.getConnection();
        }
    
        @AfterEach
        @SneakyThrows
        void after() {
            log.debug("结束！");
            this.connection.close();
        }
    
        /**
         * 测试连通性
         */
        @Test
        @SneakyThrows
        void testConnect(){
            PreparedStatement preparedStatement = connection.prepareStatement("select * from batch_demo where id = ?;");
            preparedStatement.setInt(1,1);
            ResultSet resultSet = preparedStatement.executeQuery();
        }
    
        /**
         * 普通插入1w条数据
         * 耗时：20851
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData0(){
            Statement statement = connection.createStatement();
            long starTime = System.currentTimeMillis();
            for (int i = 1; i < 10000; i++) {
                statement.executeUpdate("insert into batch_demo(id, batch_name, batch_value) value ("+i+",concat('name',"+i+"),concat('value',"+i+"));");
            }
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 普通插入1w条数据并使用手动控制事务优化
         * 耗时：5767
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData1(){
            connection.setAutoCommit(false);
            Statement statement = connection.createStatement();
            long starTime = System.currentTimeMillis();
            for (int i = 1; i < 10000; i++) {
                statement.executeUpdate("insert into batch_demo(id, batch_name, batch_value) value ("+i+",concat('name',"+i+"),concat('value',"+i+"));");
            }
            connection.commit();
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 普通插入1w条数据并使用暂存表优化
         * 耗时：5316
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData2(){
            Statement statement = connection.createStatement();
            long starTime = System.currentTimeMillis();
            statement.executeUpdate("create temporary table batch_demo_temp\n" +
                    "(\n" +
                    "    id          int         not null comment 'id'\n" +
                    "        primary key,\n" +
                    "    batch_name  varchar(32) null,\n" +
                    "    batch_value varchar(32) null\n" +
                    ") engine = MEMORY\n" +
                    "    comment '批量处理测试表暂存表';");
            for (int i = 0; i < 10000; i++) {
                statement.executeUpdate("insert into batch_demo_temp(id, batch_name, batch_value) value ("+i+",concat('name',"+i+"),concat('value',"+i+"));");
            }
            statement.executeUpdate("insert into batch_demo select * from batch_demo_temp;");
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 普通插入1w条数据并使用批处理优化
         * 注意在jdbc连接中添加rewriteBatchedStatements=true
         * 耗时：15193
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData3(){
            Statement statement = connection.createStatement();
            long starTime = System.currentTimeMillis();
            for (int i = 0; i < 10000; i++) {
                statement.addBatch("insert into batch_demo(id, batch_name, batch_value) value ("+i+",concat('name',"+i+"),concat('value',"+i+"))");
            }
            statement.executeBatch();
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 普通插入1w条数据并使用多线程优化
         * 注意线程池和数据库连接池的使用限制约束，并需要考虑线程安全问题和事务控制问题
         * 耗时：20688
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData4(){
            Statement statement = connection.createStatement();
            //手动创建线程池
            ThreadPoolExecutor poolExecutor = new ThreadPoolExecutor(Runtime.getRuntime().availableProcessors()/2, Runtime.getRuntime().availableProcessors(), 1, TimeUnit.MINUTES, new ArrayBlockingQueue<>(10000), (r, exec) -> {
                throw new RejectedExecutionException("线程池已满");
            });
            long starTime = System.currentTimeMillis();
            for (int i = 0; i < 10000; i++) {
                final int index = i;
                poolExecutor.submit(()->{
                    try {
                        statement.executeUpdate("insert into batch_demo(id, batch_name, batch_value) value ("+index+",concat('name',"+index+"),concat('value',"+index+"));");
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                });
            }
            poolExecutor.shutdown();
            poolExecutor.awaitTermination(30,TimeUnit.MINUTES);
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 使用预处理语句优化
         * 耗时：20507
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData5(){
            PreparedStatement preparedStatement = connection.prepareStatement("insert into batch_demo(id, batch_name, batch_value) value (?,?,?)");
            long starTime = System.currentTimeMillis();
            for (int i = 0; i < 10000; i++) {
                preparedStatement.setInt(1,i);
                preparedStatement.setString(2,"name"+i);
                preparedStatement.setString(3,"value"+i);
                preparedStatement.executeUpdate();
            }
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 使用预处理语句手动可控制事务优化
         * 耗时：5621
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData6(){
            connection.setAutoCommit(false);
            PreparedStatement preparedStatement = connection.prepareStatement("insert into batch_demo(id, batch_name, batch_value) value (?,?,?)");
            long starTime = System.currentTimeMillis();
            for (int i = 0; i < 10000; i++) {
                preparedStatement.setInt(1,i);
                preparedStatement.setString(2,"name"+i);
                preparedStatement.setString(3,"value"+i);
                preparedStatement.executeUpdate();
            }
            connection.commit();
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 使用预处理语句批处理方式优化
         * 耗时：281
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData7(){
            PreparedStatement preparedStatement = connection.prepareStatement("insert into batch_demo(id, batch_name, batch_value) value (?,?,?)");
            long starTime = System.currentTimeMillis();
            for (int i = 0; i < 10000; i++) {
                preparedStatement.setInt(1,i);
                preparedStatement.setString(2,"name"+i);
                preparedStatement.setString(3,"value"+i);
                preparedStatement.addBatch();
            }
            preparedStatement.executeBatch();
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    
        /**
         * 使用预处理语句多线程优化
         * 耗时：21097
         */
        @Test
        @SneakyThrows
        void testSimpleInsertData8(){
            final PreparedStatement preparedStatement = connection.prepareStatement("insert into batch_demo(id, batch_name, batch_value) value (?,?,?)");
            //手动创建线程池
            ThreadPoolExecutor poolExecutor = new ThreadPoolExecutor(Runtime.getRuntime().availableProcessors()/2, Runtime.getRuntime().availableProcessors(), 1, TimeUnit.MINUTES, new ArrayBlockingQueue<>(10000), (r, exec) -> {
                throw new RejectedExecutionException("线程池已满");
            });
            long starTime = System.currentTimeMillis();
            for (int i = 0; i < 10000; i++) {
                final int index = i;
                poolExecutor.submit(()->{
                    synchronized (this){
                        try {
                            preparedStatement.setInt(1,index);
                            preparedStatement.setString(2,"name"+index);
                            preparedStatement.setString(3,"value"+index);
                            preparedStatement.executeUpdate();
                        } catch (SQLException e) {
                            e.printStackTrace();
                        }
                    }
                });
            }
            poolExecutor.shutdown();
            poolExecutor.awaitTermination(30,TimeUnit.MINUTES);
            System.out.println("耗时："+String.valueOf(System.currentTimeMillis()-starTime));
        }
    }
    ~~~
    
    > 注意：使用批处理api需要在连接url中配置`rewriteBatchedStatements=true`

### jdbcTemplate

